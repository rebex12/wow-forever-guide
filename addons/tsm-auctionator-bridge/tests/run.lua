-- Standalone integration tests with fake Auctionator / TSM / WoW APIs.
-- Run from the repository root: lua tests/run.lua (or texlua tests/run.lua).
local passed, failed = 0, 0
local ns = {}
assert(loadfile("TSMAuctionatorBridge/Bridge.lua"))("TSMAuctionatorBridge", ns)

local function equal(actual, expected)
    assert(actual == expected, "expected " .. tostring(expected) .. ", got " .. tostring(actual))
end

local function test(name, fn)
    local ok, err = pcall(fn)
    if ok then
        passed = passed + 1
        print("PASS " .. name)
    else
        failed = failed + 1
        print("FAIL " .. name .. ": " .. tostring(err))
    end
end

local function fixture()
    local settings = { enabled = true, source = "dbminbuyout", fallback = true }
    local calls = {}
    local tsm = {
        GetCustomPriceValue = function(source, item)
            calls[#calls + 1] = { source, item }
            return 12345
        end,
        ToItemString = function() return "i:15210::suffix:23" end,
    }
    local api = {
        GetAuctionPriceByItemID = function(caller, item)
            assert(type(caller) == "string" and caller ~= "", "invalid caller")
            assert(type(item) == "number", "invalid item")
            return 900
        end,
        GetAuctionPriceByItemLink = function() return 901 end,
        GetAuctionAgeByItemID = function() return 7 end,
        GetAuctionAgeByItemLink = function() return 8 end,
        IsAuctionDataExactByItemID = function() return true end,
        IsAuctionDataExactByItemLink = function() return true end,
        GetVendorPriceByItemID = function() return 10 end,
    }
    local bridge = ns.Bridge.New(settings, function() return tsm end)
    equal(bridge:Install(api), 6)
    return bridge, settings, api, tsm, calls
end

test("TSM copper price is returned per item via Auctionator ID API", function()
    local bridge, _, api, _, calls = fixture()
    equal(api.GetAuctionPriceByItemID("Consumer", 2447), 12345)
    equal(calls[1][1], "DBMinBuyout")
    equal(calls[1][2], "i:2447")
    equal(bridge.stats.tsm, 1)
end)

test("all three built-in sources can be selected", function()
    local _, settings, api, _, calls = fixture()
    for key, display in pairs(ns.SOURCES) do
        settings.source = key
        api.GetAuctionPriceByItemID("Consumer", 2447)
        equal(calls[#calls][1], display)
    end
end)

test("links retain TSM-converted suffix/bonus information", function()
    local _, _, api, tsm, calls = fixture()
    local link = "|cffffffff|Hitem:15210:0:0:0:0:0:23:0|h[Test]|h|r"
    tsm.ToItemString = function(value)
        equal(value, link)
        return "i:15210::suffix:23"
    end
    equal(api.GetAuctionPriceByItemLink("Consumer", link), 12345)
    equal(calls[1][2], "i:15210::suffix:23")
end)

test("conversion failure never substitutes the base item price", function()
    local _, _, api, tsm, calls = fixture()
    tsm.ToItemString = function() return nil end
    equal(api.GetAuctionPriceByItemLink("Consumer", "item:15210"), 901)
    equal(#calls, 0)
    tsm.ToItemString = nil
    equal(api.GetAuctionPriceByItemLink("Consumer", "item:15210"), 901)
end)

test("missing price falls back to the original Auctionator value", function()
    local bridge, _, api, tsm = fixture()
    tsm.GetCustomPriceValue = function() return nil, "No data" end
    equal(api.GetAuctionPriceByItemID("Consumer", 2447), 900)
    equal(bridge.stats.auctionator, 1)
end)

test("disabled fallback returns nil instead of zero", function()
    local _, settings, api, tsm = fixture()
    settings.fallback = false
    tsm.GetCustomPriceValue = function() return nil end
    equal(api.GetAuctionPriceByItemID("Consumer", 2447), nil)
    equal(api.GetAuctionAgeByItemID("Consumer", 2447), nil)
    equal(api.IsAuctionDataExactByItemID("Consumer", 2447), false)
end)

test("invalid TSM numbers and non-numbers cannot escape the bridge", function()
    local _, _, api, tsm = fixture()
    for _, bad in ipairs({ 0, -1, math.huge, -math.huge, 0/0, "1200", {}, false }) do
        tsm.GetCustomPriceValue = function() return bad end
        equal(api.GetAuctionPriceByItemID("Consumer", 2447), 900)
    end
end)

test("valid fractional copper is rounded down", function()
    local _, _, api, tsm = fixture()
    tsm.GetCustomPriceValue = function() return 12345.9 end
    equal(api.GetAuctionPriceByItemID("Consumer", 2447), 12345)
end)

test("TSM initialization errors fall back and release the recursion guard", function()
    local bridge, _, api, tsm = fixture()
    tsm.GetCustomPriceValue = function() error("not initialized") end
    equal(api.GetAuctionPriceByItemID("Consumer", 2447), 900)
    equal(bridge.inTSM, false)
    equal(bridge.stats.errors, 1)
    assert(bridge.lastError:find("not initialized", 1, true))
    tsm.GetCustomPriceValue = function() return 2000 end
    equal(api.GetAuctionPriceByItemID("Consumer", 2447), 2000)
end)

test("conversion exceptions also release the guard", function()
    local bridge, _, api, tsm = fixture()
    tsm.ToItemString = function() error("conversion unavailable") end
    equal(api.GetAuctionPriceByItemLink("Consumer", "item:15210"), 901)
    equal(bridge.inTSM, false)
    equal(api.GetAuctionPriceByItemID("Consumer", 2447), 12345)
end)

test("TSM's own Auctionator calls always see the original price", function()
    local _, settings, api, _, calls = fixture()
    settings.fallback = false
    for _, caller in ipairs({ "TradeSkillMaster", "tradeskillmaster", "TSM", "Trade Skill Master" }) do
        equal(api.GetAuctionPriceByItemID(caller, 2447), 900)
        equal(api.GetAuctionAgeByItemID(caller, 2447), 7)
    end
    equal(#calls, 0)
end)

test("indirect reentry with any caller name cannot recurse into TSM", function()
    local bridge, _, api, tsm = fixture()
    local calls = 0
    tsm.GetCustomPriceValue = function()
        calls = calls + 1
        assert(calls < 2, "recursive TSM evaluation")
        return api.GetAuctionPriceByItemID("IndirectConsumer", 2447) + 10
    end
    equal(api.GetAuctionPriceByItemID("Consumer", 2447), 910)
    equal(calls, 1)
    equal(bridge.inTSM, false)
end)

test("recursion guard includes link conversion", function()
    local _, _, api, tsm = fixture()
    tsm.ToItemString = function()
        equal(api.GetAuctionPriceByItemID("IndirectConsumer", 2447), 900)
        return "i:15210"
    end
    equal(api.GetAuctionPriceByItemLink("Consumer", "item:15210"), 12345)
end)

test("off/on reversibly bypasses and enables TSM", function()
    local _, settings, api = fixture()
    settings.enabled = false
    settings.fallback = false
    equal(api.GetAuctionPriceByItemID("Consumer", 2447), 900)
    equal(api.GetAuctionAgeByItemID("Consumer", 2447), 7)
    settings.enabled = true
    equal(api.GetAuctionPriceByItemID("Consumer", 2447), 12345)
end)

test("TSM prices are not labeled with Auctionator's scan age or exactness", function()
    local _, _, api = fixture()
    equal(api.GetAuctionAgeByItemID("Consumer", 2447), nil)
    equal(api.GetAuctionAgeByItemLink("Consumer", "item:15210"), nil)
    equal(api.IsAuctionDataExactByItemID("Consumer", 2447), false)
    equal(api.IsAuctionDataExactByItemLink("Consumer", "item:15210"), false)
end)

test("metadata falls back with the same missing-price decision", function()
    local _, _, api, tsm = fixture()
    tsm.GetCustomPriceValue = function() return nil end
    equal(api.GetAuctionAgeByItemID("Consumer", 2447), 7)
    equal(api.GetAuctionAgeByItemLink("Consumer", "item:15210"), 8)
    equal(api.IsAuctionDataExactByItemLink("Consumer", "item:15210"), true)
end)

test("invalid callers and IDs retain Auctionator validation errors", function()
    local _, _, api, _, calls = fixture()
    equal(pcall(api.GetAuctionPriceByItemID, "", 2447), false)
    equal(pcall(api.GetAuctionPriceByItemID, nil, 2447), false)
    equal(pcall(api.GetAuctionPriceByItemID, "Consumer", "2447"), false)
    equal(#calls, 0)
end)

test("late TSM readiness is detected without reload", function()
    local _, _, api = fixture()
    local tsm
    local bridge = ns.Bridge.New({ enabled = true, fallback = true, source = "dbmarket" },
        function() return tsm end)
    local separateAPI = { GetAuctionPriceByItemID = function() return 55 end }
    bridge:Install(separateAPI)
    equal(separateAPI.GetAuctionPriceByItemID("Consumer", 2447), 55)
    tsm = { GetCustomPriceValue = function() return 66 end }
    equal(separateAPI.GetAuctionPriceByItemID("Consumer", 2447), 66)
    equal(api.GetAuctionPriceByItemID("Consumer", 2447), 12345)
end)

test("repeated installation is idempotent and supports optional APIs arriving later", function()
    local bridge, _, api = fixture()
    local fn = api.GetAuctionPriceByItemID
    equal(bridge:Install(api), 0)
    equal(api.GetAuctionPriceByItemID, fn)
    equal(bridge:Install(nil), 0)
    local other = ns.Bridge.New({}, function() end)
    local minimal = { GetAuctionPriceByItemID = function() end }
    equal(other:Install(minimal), 1)
    minimal.GetAuctionPriceByItemLink = function() end
    equal(other:Install(minimal), 1)
end)

test("another addon's later replacement is detected and not rewrapped", function()
    local bridge, _, api = fixture()
    api.GetAuctionPriceByItemID = function() return 42 end
    equal(bridge:IsActive("GetAuctionPriceByItemID"), false)
    equal(bridge:Install(api), 0)
    equal(api.GetAuctionPriceByItemID("Consumer", 2447), 42)
end)

test("vendor API and original function are not changed", function()
    local bridge, _, api = fixture()
    equal(api.GetVendorPriceByItemID("Consumer", 2447), 10)
    equal(bridge:OriginalPrice("ID", 2447), 900)
    equal(api.GetAuctionPriceByItemID("Consumer", 2447), 12345)
end)

test("custom strings and Auctionator-derived sources are refused", function()
    local _, settings, api, _, calls = fixture()
    settings.source = "atrvalue"
    equal(api.GetAuctionPriceByItemID("Consumer", 2447), 900)
    settings.source = "first(dbmarket,atrvalue)"
    equal(api.GetAuctionPriceByItemID("Consumer", 2447), 900)
    equal(#calls, 0)
end)

test("queries do not cache stale TSM prices", function()
    local _, _, api, tsm = fixture()
    equal(api.GetAuctionPriceByItemID("Consumer", 2447), 12345)
    tsm.GetCustomPriceValue = function() return 54321 end
    equal(api.GetAuctionPriceByItemID("Consumer", 2447), 54321)
end)

-- Exercise the actual WoW entry point and slash commands, not only the core.
local messages = {}
local wow = assert(loadfile("tests/wow_mock.lua"))()
DEFAULT_CHAT_FRAME = { AddMessage = function(_, message) messages[#messages + 1] = message end }
SlashCmdList = {}
Auctionator = { API = { v1 = {
    GetAuctionPriceByItemID = function() return 111 end,
    GetAuctionPriceByItemLink = function() return 112 end,
} } }
TSM_API = {
    GetCustomPriceValue = function(source)
        return source == "DBMinBuyout" and 222 or 333
    end,
    ToItemString = function() return "i:2447" end,
}
TSMAuctionatorBridgeDB = { source = "AtrValue", enabled = "yes", fallback = 123 }
assert(loadfile("TSMAuctionatorBridge/UI.lua"))("TSMAuctionatorBridge", ns)
assert(loadfile("TSMAuctionatorBridge/Main.lua"))("TSMAuctionatorBridge", ns)
local mockFrame = wow.widgets[#wow.widgets]

test("addon load normalizes saved settings and installs before login", function()
    mockFrame:RunScript("OnEvent", "ADDON_LOADED", "Auctionator")
    equal(Auctionator.API.v1.GetAuctionPriceByItemID("Consumer", 2447), 111)
    mockFrame:RunScript("OnEvent", "ADDON_LOADED", "TSMAuctionatorBridge")
    equal(TSMAuctionatorBridgeDB.source, "dbminbuyout")
    equal(TSMAuctionatorBridgeDB.enabled, true)
    equal(TSMAuctionatorBridgeDB.fallback, true)
    equal(Auctionator.API.v1.GetAuctionPriceByItemID("Consumer", 2447), 222)
    mockFrame:RunScript("OnEvent", "PLAYER_LOGIN")
    equal(Auctionator.API.v1.GetAuctionPriceByItemID("Consumer", 2447), 222)
end)

test("slash commands select sources and reject custom strings", function()
    SlashCmdList.TSMAUCTIONATORBRIDGE("source DBMarket")
    equal(TSMAuctionatorBridgeDB.source, "dbmarket")
    equal(Auctionator.API.v1.GetAuctionPriceByItemID("Consumer", 2447), 333)
    SlashCmdList.TSMAUCTIONATORBRIDGE("source first(dbmarket,atrvalue)")
    equal(TSMAuctionatorBridgeDB.source, "dbmarket")
end)

test("slash commands save enabled and fallback settings", function()
    SlashCmdList.TSMAUCTIONATORBRIDGE("off")
    equal(Auctionator.API.v1.GetAuctionPriceByItemID("Consumer", 2447), 111)
    SlashCmdList.TSMAUCTIONATORBRIDGE("on")
    equal(Auctionator.API.v1.GetAuctionPriceByItemID("Consumer", 2447), 333)
    SlashCmdList.TSMAUCTIONATORBRIDGE("fallback off")
    equal(TSMAuctionatorBridgeDB.fallback, false)
    SlashCmdList.TSMAUCTIONATORBRIDGE("fallback broken")
    equal(TSMAuctionatorBridgeDB.fallback, false)
    SlashCmdList.TSMAUCTIONATORBRIDGE("fallback on")
    equal(TSMAuctionatorBridgeDB.fallback, true)
end)

test("status, diagnostics, help and malformed input do not throw", function()
    for _, command in ipairs({ "status", "", "help", "test 2447", "test i:2447",
        "test |Hitem:2447:0|h[Test]|h", "test potato", "test", "source", "fallback" }) do
        SlashCmdList.TSMAUCTIONATORBRIDGE(command)
    end
    assert(#messages > 10)
    local found = false
    for _, message in ipairs(messages) do
        if message:find("Price returned through Auctionator API: 0g 3s 33c", 1, true) then
            found = true
        end
    end
    assert(found, "diagnostic did not report the returned price")
end)

test("default slash command opens a reusable window without querying prices", function()
    if ns.UI.window then ns.UI.window:Hide() end
    local calls = 0
    TSM_API.GetCustomPriceValue = function() calls = calls + 1; return 333 end
    local chatBefore = #messages
    SlashCmdList.TSMAUCTIONATORBRIDGE("")
    local window = ns.UI.window
    assert(window:IsShown())
    equal(calls, 0)
    equal(#messages, chatBefore)
    local widgetCount = #wow.widgets
    SlashCmdList.TSMAUCTIONATORBRIDGE("")
    equal(window:IsShown(), false)
    SlashCmdList.TSMAUCTIONATORBRIDGE("ui")
    equal(ns.UI.window, window)
    equal(#wow.widgets, widgetCount)
    equal(#UISpecialFrames, 1)
    equal(#wow.hooks, 1)
    TSM_API.GetCustomPriceValue = function(source)
        return source == "DBMinBuyout" and 222 or 333
    end
end)

test("UI source buttons save settings and change delivered prices", function()
    local window = ns.UI.window
    window.sources[1]:Click()
    equal(TSMAuctionatorBridgeDB.source, "dbminbuyout")
    equal(Auctionator.API.v1.GetAuctionPriceByItemID("Consumer", 2447), 222)
    assert(window.sources[1].selected)
    equal(window.sources[2].selected, false)
    window.sources[2]:Click()
    equal(TSMAuctionatorBridgeDB.source, "dbmarket")
    equal(Auctionator.API.v1.GetAuctionPriceByItemID("Consumer", 2447), 333)
end)

test("UI enabled checkbox bypasses and restores the real bridge", function()
    local window = ns.UI.window
    window.enabled:Click()
    equal(TSMAuctionatorBridgeDB.enabled, false)
    equal(Auctionator.API.v1.GetAuctionPriceByItemID("Consumer", 2447), 111)
    window.enabled:Click()
    equal(TSMAuctionatorBridgeDB.enabled, true)
    equal(Auctionator.API.v1.GetAuctionPriceByItemID("Consumer", 2447), 333)
end)

test("UI comparison shows all three prices without chat messages", function()
    local window = ns.UI.window
    local chatBefore = #messages
    window.input:SetText("2447")
    window.compareButton:Click()
    equal(window.prices[1].value:GetText(), "0g 3s 33c")
    equal(window.prices[2].value:GetText(), "0g 1s 11c")
    equal(window.prices[3].value:GetText(), "0g 3s 33c")
    equal(window.lastComparison.tone, "success")
    equal(#messages, chatBefore)
end)

test("changing a setting or item clears stale comparisons", function()
    local window = ns.UI.window
    window.sources[3]:Click()
    equal(window.lastComparison, nil)
    equal(window.prices[3].value:GetText(), "--")
    window.compareButton:Click()
    assert(window.lastComparison.ok)
    window.input:SetText("2449")
    equal(window.lastComparison, nil)
    equal(window.prices[3].value:GetText(), "--")
end)

test("Enter compares an item and malformed input reports an inline error", function()
    local window = ns.UI.window
    window.input:SetText("i:2447")
    window.input:RunScript("OnEnterPressed")
    assert(window.lastComparison.ok)
    window.input:SetText("potato")
    window.compareButton:Click()
    equal(window.lastComparison.ok, false)
    equal(window.prices[1].value:GetText(), "--")
    equal(window.resultMessage:GetText(), "Enter an item ID or paste an item link.")
end)

test("UI fallback control handles missing TSM data and unavailable TSM API", function()
    local window = ns.UI.window
    local tsm = TSM_API
    TSM_API = nil
    window.input:SetText("2447")
    window.compareButton:Click()
    equal(window.prices[1].value:GetText(), "unavailable")
    equal(window.prices[3].value:GetText(), "0g 1s 11c")
    window.fallback:Click()
    equal(TSMAuctionatorBridgeDB.fallback, false)
    window.compareButton:Click()
    equal(window.prices[3].value:GetText(), "unavailable")
    window.fallback:Click()
    equal(TSMAuctionatorBridgeDB.fallback, true)
    TSM_API = tsm
end)

test("status refresh does not issue TSM price lookups", function()
    local calls = 0
    local original = TSM_API.GetCustomPriceValue
    TSM_API.GetCustomPriceValue = function() calls = calls + 1; return 333 end
    local window = ns.UI.window
    for _ = 1, 5 do window:RunScript("OnUpdate", 1) end
    equal(calls, 0)
    assert(window.stats:GetText():find("THIS SESSION", 1, true))
    TSM_API.GetCustomPriceValue = original
end)

test("shift-click links only populate the focused visible comparison field", function()
    local window = ns.UI.window
    local link = "|Hitem:2447:0|h[Peacebloom]|h"
    window.input:SetText("2447")
    window.input:ClearFocus()
    equal(ChatEdit_InsertLink(link), false)
    equal(window.input:GetText(), "2447")
    window.input:SetFocus()
    equal(ChatEdit_InsertLink(link), false)
    equal(window.input:GetText(), link)
    window.compareButton:Click()
    assert(window.lastComparison.ok)
    window:Hide()
    ChatEdit_InsertLink("item:2449")
    equal(window.input:GetText(), link)
    window:Show()
end)

test("window close and Escape release focus; small screens scale the window", function()
    local window = ns.UI.window
    window.input:SetFocus()
    window.input:RunScript("OnEscapePressed")
    equal(window:IsShown(), false)
    equal(window.input:HasFocus(), false)
    UIParent:SetSize(800, 600)
    window:Show()
    assert(window.scale < 1 and window.scale > 0)
    window.close:Click()
    equal(window:IsShown(), false)
    UIParent:SetSize(1280, 900)
    window:Show()
    equal(window.scale, 1)
end)

test("external slash setting changes are reflected in the open window", function()
    local window = ns.UI.window
    window.input:SetText("2447")
    window.compareButton:Click()
    SlashCmdList.TSMAUCTIONATORBRIDGE("source dbminbuyout")
    window:RunScript("OnUpdate", 1)
    assert(window.sources[1].selected)
    equal(window.lastComparison, nil)
    equal(window.prices[3].value:GetText(), "--")
end)

print(string.format("\n%d passed; %d failed.", passed, failed))
if failed > 0 then os.exit(1) end
