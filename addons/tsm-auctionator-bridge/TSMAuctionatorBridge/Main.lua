local ADDON, ns = ...
local bridge
ns.VERSION = "0.2.0-alpha"
ns.Controller = {}
local Controller = ns.Controller
local revision = 0
local frame = CreateFrame("Frame")

local function say(message)
    local text = "|cff65c7ffTSM Bridge|r: " .. message
    if DEFAULT_CHAT_FRAME then
        DEFAULT_CHAT_FRAME:AddMessage(text)
    else
        print(text)
    end
end

local function initialize()
    if bridge then
        return
    end
    if type(TSMAuctionatorBridgeDB) ~= "table" then
        TSMAuctionatorBridgeDB = {}
    end
    local settings = TSMAuctionatorBridgeDB
    if type(settings.enabled) ~= "boolean" then settings.enabled = true end
    if type(settings.fallback) ~= "boolean" then settings.fallback = true end
    if type(settings.source) == "string" then settings.source = settings.source:lower() end
    if not ns.SOURCES[settings.source] then settings.source = "dbminbuyout" end
    settings.version = 1
    bridge = ns.Bridge.New(settings, function() return TSM_API end)
end

local function getAuctionatorAPI()
    if type(Auctionator) == "table" and type(Auctionator.API) == "table"
        and type(Auctionator.API.v1) == "table" then
        return Auctionator.API.v1
    end
    return nil
end

local function install()
    initialize()
    bridge:Install(getAuctionatorAPI())
end

local function money(value)
    if type(value) ~= "number" or value < 1 or value >= math.huge or value ~= value then
        return "unavailable"
    end
    value = math.floor(value)
    if type(GetCoinTextureString) == "function" then
        return GetCoinTextureString(value)
    end
    return string.format("%dg %ds %dc", math.floor(value / 10000),
        math.floor(value / 100) % 100, value % 100)
end

function Controller:FormatPrice(value)
    return money(value)
end

function Controller:GetState()
    install()
    local tsm = TSM_API
    return {
        enabled = bridge.settings.enabled,
        fallback = bridge.settings.fallback,
        source = bridge.settings.source,
        sourceName = ns.SOURCES[bridge.settings.source],
        connectedID = bridge:IsActive("GetAuctionPriceByItemID"),
        connectedLink = bridge:IsActive("GetAuctionPriceByItemLink"),
        tsmAvailable = type(tsm) == "table" and type(tsm.GetCustomPriceValue) == "function",
        stats = bridge.stats,
        lastError = bridge.lastError,
        revision = revision,
        version = ns.VERSION,
    }
end

function Controller:SetOption(key, value)
    install()
    if (key == "source" and not ns.SOURCES[value])
        or ((key == "enabled" or key == "fallback") and type(value) ~= "boolean")
        or (key ~= "source" and key ~= "enabled" and key ~= "fallback") then
        return false
    end
    if bridge.settings[key] ~= value then
        bridge.settings[key] = value
        revision = revision + 1
    end
    return true
end

-- Shared by the window and the text diagnostic command. No item is probed by
-- the window's periodic status refresh; lookups happen only on Compare.
function Controller:Compare(input)
    install()
    input = type(input) == "string" and input:match("^%s*(.-)%s*$") or ""
    local kind, item
    local id = tonumber(input) or tonumber(input:match("^i:(%d+)$"))
    if id and id > 0 and id < math.huge and id == math.floor(id) then
        kind, item = "ID", id
    elseif input:match("item:%d+") then
        kind, item = "Link", input
    else
        return { ok = false, message = "Enter an item ID or paste an item link." }
    end

    local tsmPrice = bridge:GetTSMPrice(kind, item)
    local originalOK, originalPrice = pcall(bridge.OriginalPrice, bridge, kind, item)
    local method = "GetAuctionPriceByItem" .. kind
    local api = getAuctionatorAPI()
    local fn = api and api[method]
    local resultOK, deliveredPrice
    if type(fn) == "function" then
        resultOK, deliveredPrice = pcall(fn, "TSMAuctionatorBridge", item)
    end
    local result = {
        ok = true,
        tsmPrice = tsmPrice,
        auctionatorPrice = originalOK and originalPrice or nil,
        deliveredPrice = resultOK and deliveredPrice or nil,
        originalOK = originalOK,
        deliveredOK = resultOK,
        sourceName = ns.SOURCES[bridge.settings.source],
        input = input,
    }
    if not resultOK then
        result.message, result.tone = "Auctionator's price function is unavailable or returned an error.", "error"
    elseif not bridge:IsActive(method) then
        result.message, result.tone = "The price function was replaced by another addon. Its returned price is shown above.", "warning"
    elseif not bridge.settings.enabled then
        result.message, result.tone = "Bridge is off. Addons receive Auctionator's original price.", "warning"
    elseif tsmPrice then
        result.message, result.tone = "Addons receive TSM " .. result.sourceName .. ".", "success"
    elseif bridge.settings.fallback and originalOK and originalPrice then
        result.message, result.tone = "No TSM price. Addons receive Auctionator's original price.", "warning"
    else
        result.message, result.tone = "No price available with the current settings.", "warning"
    end
    return result
end

local function settingChanged()
    say("Setting saved. Reopen the receiving addon's window; if it caches prices, use /reload.")
end

local function showStatus()
    local settings = bridge.settings
    say("v" .. ns.VERSION .. "; " .. (settings.enabled and "enabled" or "disabled")
        .. "; source: " .. ns.SOURCES[settings.source]
        .. "; Auctionator fallback: " .. (settings.fallback and "on" or "off"))
    say("API by ID: " .. (bridge:IsActive("GetAuctionPriceByItemID") and "connected" or "not connected")
        .. "; by link: " .. (bridge:IsActive("GetAuctionPriceByItemLink") and "connected" or "not connected"))
    local tsm = TSM_API
    say("TSM price API: " .. ((type(tsm) == "table" and type(tsm.GetCustomPriceValue) == "function")
        and "present (use test to check data)" or "unavailable"))
    local stats = bridge.stats
    say(string.format("This session: TSM %d; Auctionator %d; missing %d; bypassed %d; TSM errors %d.",
        stats.tsm, stats.auctionator, stats.missing, stats.bypass, stats.errors))
    if bridge.lastError then say("Last TSM error: " .. bridge.lastError) end
end

local function testItem(input)
    local result = Controller:Compare(input)
    if not result.ok then
        say("Usage: /tsmbridge test <itemID or shift-clicked item link>")
        return
    end
    say("TSM " .. result.sourceName .. ": " .. money(result.tsmPrice)
        .. "; original Auctionator: " .. (result.originalOK and money(result.auctionatorPrice) or "API error"))
    say("Price returned through Auctionator API: " .. (result.deliveredOK and money(result.deliveredPrice) or "API unavailable/error"))
end

local function command(message)
    install()
    message = (message or ""):match("^%s*(.-)%s*$")
    local action, rest = message:match("^(%S+)%s*(.-)$")
    action = action and action:lower() or "ui"
    if action == "ui" or action == "config" then
        ns.UI.Toggle(Controller)
    elseif action == "status" then
        showStatus()
    elseif action == "on" or action == "off" then
        Controller:SetOption("enabled", action == "on")
        settingChanged()
    elseif action == "source" then
        local source = rest:lower()
        if not ns.SOURCES[source] then
            say("Sources: dbminbuyout, dbmarket, dbrecent. Example: /tsmbridge source dbmarket")
            return
        end
        Controller:SetOption("source", source)
        settingChanged()
    elseif action == "fallback" then
        rest = rest:lower()
        if rest ~= "on" and rest ~= "off" then
            say("Usage: /tsmbridge fallback on|off")
            return
        end
        Controller:SetOption("fallback", rest == "on")
        settingChanged()
    elseif action == "test" then
        testItem(rest)
    else
        say("/tsmbridge opens the window. Text commands: status | on | off | source dbminbuyout|dbmarket|dbrecent | fallback on|off | test <itemID/link>")
    end
end

SLASH_TSMAUCTIONATORBRIDGE1 = "/tsmbridge"
SlashCmdList.TSMAUCTIONATORBRIDGE = command

frame:RegisterEvent("ADDON_LOADED")
frame:RegisterEvent("PLAYER_LOGIN")
frame:SetScript("OnEvent", function(_, event, name)
    if event == "PLAYER_LOGIN" or name == ADDON
        or name == "Auctionator" or name == "TradeSkillMaster" then
        -- Saved variables are available when our own ADDON_LOADED fires.
        -- Dependency events can fire before our own event, but only after this
        -- addon's Lua has run; avoid creating settings until our event/login.
        if event == "PLAYER_LOGIN" or name == ADDON or bridge then
            install()
        end
    end
    if event == "PLAYER_LOGIN" then
        if not bridge:IsActive("GetAuctionPriceByItemID")
            or not bridge:IsActive("GetAuctionPriceByItemLink") then
            say("Auctionator price API not connected. Run /tsmbridge status.")
        end
    end
end)
