local _, ns = ...

-- Only built-in AuctionDB sources are accepted. Arbitrary custom strings could
-- reference AtrValue (Auctionator) and create a circular price dependency.
ns.SOURCES = {
    dbminbuyout = "DBMinBuyout",
    dbmarket = "DBMarket",
    dbrecent = "DBRecent",
}

local Bridge = {}
Bridge.__index = Bridge
ns.Bridge = Bridge

local function validPrice(value)
    return type(value) == "number" and value >= 1
        and value < math.huge and value == value
end

local function validItem(kind, item)
    if kind == "ID" then
        return type(item) == "number" and item > 0 and item < math.huge
            and item == math.floor(item)
    end
    return type(item) == "string" and item ~= ""
end

local function isTSMCaller(caller)
    local normalized = caller:lower():gsub("[%s_%-]", "")
    return normalized == "tradeskillmaster" or normalized == "tsm"
end

function Bridge.New(settings, getTSM)
    return setmetatable({
        settings = settings,
        getTSM = getTSM,
        inTSM = false,
        bindings = {},
        stats = { tsm = 0, auctionator = 0, missing = 0, bypass = 0, errors = 0 },
    }, Bridge)
end

function Bridge:ShouldBypass(caller, kind, item)
    return self.inTSM or not self.settings.enabled
        or type(caller) ~= "string" or caller == ""
        or not validItem(kind, item) or isTSMCaller(caller)
end

function Bridge:GetTSMPrice(kind, item)
    if self.inTSM or not validItem(kind, item) then
        return nil
    end
    local tsm = self.getTSM()
    if type(tsm) ~= "table" or type(tsm.GetCustomPriceValue) ~= "function" then
        return nil
    end
    local source = ns.SOURCES[self.settings.source]
    if not source then
        return nil
    end

    -- Guard the conversion too: neither TSM call may re-enter this bridge.
    self.inTSM = true
    local ok, value = pcall(function()
        local itemString
        if kind == "ID" then
            itemString = "i:" .. string.format("%.0f", item)
        else
            if type(tsm.ToItemString) ~= "function" then
                return nil
            end
            itemString = tsm.ToItemString(item)
            -- Preserve suffixes / bonus IDs. Do not substitute a base item price
            -- when the full link cannot be converted.
            if type(itemString) ~= "string" or not itemString:match("^i:%d+") then
                return nil
            end
        end
        return tsm.GetCustomPriceValue(source, itemString)
    end)
    self.inTSM = false

    if not ok then
        self.stats.errors = self.stats.errors + 1
        self.lastError = tostring(value)
        return nil
    end
    if validPrice(value) then
        return math.floor(value)
    end
    return nil
end

function Bridge:MakeWrapper(original, kind, resultType)
    local bridge = self
    return function(caller, item, ...)
        if bridge:ShouldBypass(caller, kind, item) then
            if resultType == "price" then
                bridge.stats.bypass = bridge.stats.bypass + 1
            end
            -- Keep Auctionator's own validation and error behavior intact.
            return original(caller, item, ...)
        end

        local price = bridge:GetTSMPrice(kind, item)
        if price then
            if resultType == "price" then
                bridge.stats.tsm = bridge.stats.tsm + 1
                return price
            elseif resultType == "age" then
                -- TSM's value API does not provide a matching observation date.
                -- Never attach an unrelated Auctionator scan date to this value.
                return nil
            else
                -- An external market value is not an exact Auctionator scan.
                return false
            end
        end

        if bridge.settings.fallback then
            if resultType ~= "price" then
                return original(caller, item, ...)
            end
            local value = original(caller, item, ...)
            if validPrice(value) then
                bridge.stats.auctionator = bridge.stats.auctionator + 1
            else
                bridge.stats.missing = bridge.stats.missing + 1
            end
            return value
        end
        if resultType == "price" then
            bridge.stats.missing = bridge.stats.missing + 1
        elseif resultType == "exact" then
            return false
        end
        return nil
    end
end

function Bridge:Install(api)
    if type(api) ~= "table" then
        return 0
    end
    local count = 0
    local definitions = {
        { "GetAuctionPriceByItemID", "ID", "price" },
        { "GetAuctionPriceByItemLink", "Link", "price" },
        { "GetAuctionAgeByItemID", "ID", "age" },
        { "GetAuctionAgeByItemLink", "Link", "age" },
        { "IsAuctionDataExactByItemID", "ID", "exact" },
        { "IsAuctionDataExactByItemLink", "Link", "exact" },
    }
    for _, definition in ipairs(definitions) do
        local name, kind, resultType = definition[1], definition[2], definition[3]
        local original = api[name]
        if not self.bindings[name] and type(original) == "function" then
            local wrapper = self:MakeWrapper(original, kind, resultType)
            self.bindings[name] = { api = api, original = original, wrapper = wrapper }
            api[name] = wrapper
            count = count + 1
        end
        -- Do not wrap another addon's replacement: it might already call us.
        -- A reload is needed if someone replaces the API after installation.
    end
    return count
end

function Bridge:IsActive(name)
    local binding = self.bindings[name]
    return binding ~= nil and binding.api[name] == binding.wrapper
end

function Bridge:OriginalPrice(kind, item)
    local binding = self.bindings["GetAuctionPriceByItem" .. kind]
    if binding then
        return binding.original("TSMAuctionatorBridge", item)
    end
    return nil
end
