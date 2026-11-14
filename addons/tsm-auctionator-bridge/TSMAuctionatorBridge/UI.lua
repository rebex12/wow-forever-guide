local _, ns = ...
ns.UI = {}
local UI = ns.UI
local WIDTH, HEIGHT = 660, 654
local colors = {
    background = { 0.035, 0.045, 0.065, 0.98 },
    panel = { 0.07, 0.09, 0.12, 1 },
    border = { 0.20, 0.26, 0.33, 1 },
    accent = { 0.32, 0.76, 0.97, 1 },
    selected = { 0.08, 0.18, 0.25, 1 },
    muted = { 0.64, 0.70, 0.77, 1 },
    text = { 0.90, 0.94, 0.98, 1 },
    success = { 0.38, 0.87, 0.63, 1 },
    warning = { 1, 0.77, 0.38, 1 },
    error = { 1, 0.44, 0.44, 1 },
}
local unpackColor = unpack or table.unpack
local backdrop = {
    bgFile = "Interface\\Buttons\\WHITE8X8",
    edgeFile = "Interface\\Buttons\\WHITE8X8",
    edgeSize = 1,
}

local function paint(frame, background, border)
    frame:SetBackdropColor(unpackColor(background))
    frame:SetBackdropBorderColor(unpackColor(border or colors.border))
end

local function panel(parent, width, height, x, y)
    local frame = CreateFrame("Frame", nil, parent, "BackdropTemplate")
    frame:SetSize(width, height)
    frame:SetPoint("TOPLEFT", parent, "TOPLEFT", x, -y)
    frame:SetBackdrop(backdrop)
    paint(frame, colors.panel)
    return frame
end

local function label(parent, text, x, y, width, font, color)
    local fs = parent:CreateFontString(nil, "OVERLAY", font or "GameFontHighlightSmall")
    fs:SetPoint("TOPLEFT", parent, "TOPLEFT", x, -y)
    if width then fs:SetWidth(width) end
    fs:SetJustifyH("LEFT")
    fs:SetJustifyV("TOP")
    fs:SetTextColor(unpackColor(color or colors.text))
    fs:SetText(text)
    return fs
end

local function check(parent, text, x, y, onClick)
    local button = CreateFrame("CheckButton", nil, parent)
    button:SetPoint("TOPLEFT", parent, "TOPLEFT", x, -y)
    button:SetSize(26, 26)
    button:SetNormalTexture("Interface\\Buttons\\UI-CheckBox-Up")
    button:SetPushedTexture("Interface\\Buttons\\UI-CheckBox-Down")
    button:SetHighlightTexture("Interface\\Buttons\\UI-CheckBox-Highlight")
    button:SetCheckedTexture("Interface\\Buttons\\UI-CheckBox-Check")
    button:SetHitRectInsets(0, -540, 0, 0)
    button.label = label(button, text, 32, 5, 535, "GameFontHighlight")
    button:SetScript("OnClick", function(self) onClick(self:GetChecked() and true or false) end)
    return button
end

local function action(parent, text, width, x, y, onClick)
    local button = CreateFrame("Button", nil, parent, "UIPanelButtonTemplate")
    button:SetSize(width, 28)
    button:SetPoint("TOPLEFT", parent, "TOPLEFT", x, -y)
    button:SetText(text)
    button:SetScript("OnClick", onClick)
    return button
end

local function sourceCard(parent, key, title, description, x, onClick)
    local card = CreateFrame("Button", nil, parent, "BackdropTemplate")
    card:SetSize(196, 78)
    card:SetPoint("TOPLEFT", parent, "TOPLEFT", x, -191)
    card:SetBackdrop(backdrop)
    card.key = key
    card.title = label(card, title, 12, 12, 172, "GameFontHighlight", colors.accent)
    card.description = label(card, description, 12, 34, 172, nil, colors.muted)
    card.description:SetHeight(32)
    card:SetScript("OnClick", function() onClick(key) end)
    card:SetScript("OnEnter", function(self) paint(self, colors.selected, colors.accent) end)
    card:SetScript("OnLeave", function(self)
        paint(self, self.selected and colors.selected or colors.panel,
            self.selected and colors.accent or colors.border)
    end)
    return card
end

local function priceCard(parent, title, x, accent)
    local card = panel(parent, 196, 80, x, 393)
    card.title = label(card, title, 12, 12, 172, nil, colors.muted)
    card.value = label(card, "--", 12, 38, 172, "GameFontHighlight", accent or colors.text)
    card.value:SetHeight(30)
    return card
end

local function setStatus(fs, name, available)
    fs:SetText((available and "|cff61dda1" or "|cffffc561") .. name
        .. ": " .. (available and "ready" or "unavailable") .. "|r")
end

function UI.Create(controller)
    if UI.window then return UI.window end
    local window = CreateFrame("Frame", "TSMAuctionatorBridgeWindow", UIParent, "BackdropTemplate")
    window:Hide()
    window:SetSize(WIDTH, HEIGHT)
    window:SetPoint("CENTER", UIParent, "CENTER", 0, 0)
    window:SetFrameStrata("DIALOG")
    window:SetClampedToScreen(true)
    window:SetMovable(true)
    window:EnableMouse(true)
    window:SetBackdrop(backdrop)
    paint(window, colors.background)
    UI.window = window
    window.controller = controller

    label(window, "TSM Auctionator Bridge", 24, 22, 540, "GameFontNormalLarge", colors.text)
    label(window, "PRICES FROM TSM", 25, 48, 350, nil, colors.accent)
    label(window, "v" .. ns.VERSION, 474, 48, 150, nil, colors.muted):SetJustifyH("RIGHT")
    local drag = CreateFrame("Frame", nil, window)
    drag:SetPoint("TOPLEFT", window, "TOPLEFT", 0, 0)
    drag:SetSize(WIDTH - 40, 70)
    drag:EnableMouse(true)
    drag:RegisterForDrag("LeftButton")
    drag:SetScript("OnDragStart", function() window:StartMoving() end)
    drag:SetScript("OnDragStop", function() window:StopMovingOrSizing() end)
    window.close = CreateFrame("Button", nil, window, "UIPanelCloseButton")
    window.close:SetPoint("TOPRIGHT", window, "TOPRIGHT", -8, -8)
    window.close:SetScript("OnClick", function() window:Hide() end)

    local status = panel(window, 612, 34, 24, 78)
    window.bridgeStatus = label(status, "", 12, 10, 172)
    window.auctionatorStatus = label(status, "", 202, 10, 202)
    window.tsmStatus = label(status, "", 430, 10, 172)

    window.enabled = check(window, "Use TSM prices for other addons", 24, 125, function(value)
        controller:SetOption("enabled", value)
        window:Refresh()
    end)
    label(window, "PRICE SOURCE", 26, 169, 570, nil, colors.muted)
    window.sources = {
        sourceCard(window, "dbminbuyout", "DBMinBuyout", "Lowest buyout in the\nlatest TSM update.", 24, function(key)
            controller:SetOption("source", key); window:Refresh()
        end),
        sourceCard(window, "dbmarket", "DBMarket", "Weighted market value\nover 14 days.", 232, function(key)
            controller:SetOption("source", key); window:Refresh()
        end),
        sourceCard(window, "dbrecent", "DBRecent", "Market value from the\nlatest price snapshot.", 440, function(key)
            controller:SetOption("source", key); window:Refresh()
        end),
    }
    window.fallback = check(window, "Use Auctionator when TSM has no price", 24, 279, function(value)
        controller:SetOption("fallback", value)
        window:Refresh()
    end)

    label(window, "COMPARE AN ITEM", 26, 327, 570, nil, colors.muted)
    local inputPanel = panel(window, 474, 34, 24, 348)
    window.input = CreateFrame("EditBox", nil, inputPanel)
    window.input:SetPoint("TOPLEFT", inputPanel, "TOPLEFT", 10, -1)
    window.input:SetSize(454, 32)
    window.input:SetFontObject("ChatFontNormal")
    window.input:SetAutoFocus(false)
    window.input:SetMaxLetters(1024)
    window.input:SetTextInsets(0, 0, 0, 0)
    window.input:SetText("")
    window.placeholder = label(inputPanel, "Item ID or paste an item link", 10, 11, 445, nil, colors.muted)
    window.input:SetScript("OnTextChanged", function(self)
        window.placeholder:SetShown(self:GetText() == "")
        window:ClearComparison()
    end)
    window.input:SetScript("OnEnterPressed", function(self) self:ClearFocus(); window:Compare() end)
    window.input:SetScript("OnEscapePressed", function() window:Hide() end)
    window.compareButton = action(window, "Compare", 126, 510, 351, function()
        window.input:ClearFocus()
        window:Compare()
    end)
    window.prices = {
        priceCard(window, "TSM", 24),
        priceCard(window, "Auctionator", 232),
        priceCard(window, "Delivered to addons", 440, colors.accent),
    }
    window.resultMessage = label(window, "Enter an item above to compare prices.", 26, 485, 608, nil, colors.muted)
    window.resultMessage:SetHeight(34)
    label(window, "Changes are saved automatically. Reopen the receiving addon's window to refresh cached prices.",
        26, 532, 608, nil, colors.muted):SetHeight(34)
    window.stats = label(window, "", 26, 580, 608, nil, colors.muted)
    window.stats:SetHeight(32)
    window.error = label(window, "", 26, 618, 608, nil, colors.error)
    window.error:SetHeight(22)

    function window:ClearComparison()
        self.lastComparison = nil
        for _, card in ipairs(self.prices) do card.value:SetText("--") end
        self.resultMessage:SetText("Enter an item above to compare prices.")
        self.resultMessage:SetTextColor(unpackColor(colors.muted))
    end

    function window:Compare()
        self:Refresh()
        local result = controller:Compare(self.input:GetText())
        self.lastComparison = result
        if result.ok then
            self.prices[1].value:SetText(controller:FormatPrice(result.tsmPrice))
            self.prices[2].value:SetText(controller:FormatPrice(result.auctionatorPrice))
            self.prices[3].value:SetText(controller:FormatPrice(result.deliveredPrice))
        else
            for _, card in ipairs(self.prices) do card.value:SetText("--") end
        end
        self.resultMessage:SetText(result.message)
        self.resultMessage:SetTextColor(unpackColor(colors[result.tone] or colors.error))
        self:Refresh()
    end

    function window:Refresh()
        local state = controller:GetState()
        if self.revision ~= state.revision then
            self.revision = state.revision
            self:ClearComparison()
        end
        self.enabled:SetChecked(state.enabled)
        self.fallback:SetChecked(state.fallback)
        for _, card in ipairs(self.sources) do
            card.selected = card.key == state.source
            paint(card, card.selected and colors.selected or colors.panel,
                card.selected and colors.accent or colors.border)
        end
        self.prices[1].title:SetText("TSM " .. state.sourceName)
        self.bridgeStatus:SetText(state.enabled and "|cff61dda1Bridge: on|r" or "|cffffc561Bridge: off|r")
        setStatus(self.auctionatorStatus, "Auctionator", state.connectedID and state.connectedLink)
        setStatus(self.tsmStatus, "TSM API", state.tsmAvailable)
        self.stats:SetText(string.format("THIS SESSION   TSM: %d    Auctionator: %d    Missing: %d    Errors: %d",
            state.stats.tsm, state.stats.auctionator, state.stats.missing, state.stats.errors))
        local errorText = state.lastError and ("Last TSM error: " .. state.lastError:gsub("[\r\n]", " ")) or ""
        self.error:SetText(errorText:sub(1, 180))
    end

    window:SetScript("OnShow", function(self)
        local scale = math.min(1, (UIParent:GetWidth() - 30) / WIDTH,
            (UIParent:GetHeight() - 30) / HEIGHT)
        self:SetScale(math.max(0.1, scale))
        self.elapsed = 0
        self:Refresh()
    end)
    window:SetScript("OnHide", function(self) self.input:ClearFocus() end)
    window:SetScript("OnUpdate", function(self, elapsed)
        self.elapsed = (self.elapsed or 0) + elapsed
        if self.elapsed >= 1 then self.elapsed = 0; self:Refresh() end
    end)
    if type(UISpecialFrames) == "table" then
        table.insert(UISpecialFrames, "TSMAuctionatorBridgeWindow")
    end
    -- Add a passive hook once. Do not replace ChatEdit_InsertLink or change its
    -- return value: only take the link while this comparison field has focus.
    if type(hooksecurefunc) == "function" and type(ChatEdit_InsertLink) == "function" then
        hooksecurefunc("ChatEdit_InsertLink", function(link)
            if window:IsShown() and window.input:HasFocus() and type(link) == "string" then
                window.input:SetText(link)
                window.input:SetCursorPosition(0)
            end
        end)
    end
    return window
end

function UI.Toggle(controller)
    local window = UI.Create(controller)
    if window:IsShown() then window:Hide() else window:Show() end
end
