-- Minimal, explicit WoW widget API for exercising the real window callbacks.
-- This is not a client renderer and does not claim to validate Blizzard skins.
local mock = { widgets = {}, hooks = {} }
local Widget = {}
Widget.__index = Widget

function Widget:SetScript(event, callback) self.scripts[event] = callback end
function Widget:RunScript(event, ...)
    if self.scripts[event] then return self.scripts[event](self, ...) end
end
function Widget:RegisterEvent(event) self.events[event] = true end
function Widget:SetSize(width, height) self.width, self.height = width, height end
function Widget:SetWidth(width) self.width = width end
function Widget:SetHeight(height) self.height = height end
function Widget:GetWidth() return self.width or 0 end
function Widget:GetHeight() return self.height or 0 end
function Widget:SetPoint(point, relative, relativePoint, x, y)
    self.point = { point, relative, relativePoint, x, y }
end
function Widget:SetBackdrop(value) self.backdrop = value end
function Widget:SetBackdropColor(...) self.background = { ... } end
function Widget:SetBackdropBorderColor(...) self.border = { ... } end
function Widget:SetTextColor(...) self.color = { ... } end
function Widget:SetJustifyH(value) self.justifyH = value end
function Widget:SetJustifyV(value) self.justifyV = value end
function Widget:SetText(text)
    self.text = text
    self:RunScript("OnTextChanged", false)
end
function Widget:GetText() return self.text or "" end
function Widget:SetChecked(checked) self.checked = checked and true or false end
function Widget:GetChecked() return self.checked end
function Widget:SetFrameStrata(value) self.strata = value end
function Widget:SetClampedToScreen(value) self.clamped = value end
function Widget:SetMovable(value) self.movable = value end
function Widget:EnableMouse(value) self.mouse = value end
function Widget:RegisterForDrag(...) self.dragButtons = { ... } end
function Widget:StartMoving() self.moving = true end
function Widget:StopMovingOrSizing() self.moving = false end
function Widget:SetNormalTexture(value) self.normalTexture = value end
function Widget:SetPushedTexture(value) self.pushedTexture = value end
function Widget:SetHighlightTexture(value) self.highlightTexture = value end
function Widget:SetCheckedTexture(value) self.checkedTexture = value end
function Widget:SetHitRectInsets(...) self.hitRect = { ... } end
function Widget:SetFontObject(value) self.font = value end
function Widget:SetAutoFocus(value) self.autoFocus = value end
function Widget:SetMaxLetters(value) self.maxLetters = value end
function Widget:SetTextInsets(...) self.textInsets = { ... } end
function Widget:SetCursorPosition(value) self.cursor = value end
function Widget:SetFocus() self.focused = true end
function Widget:ClearFocus() self.focused = false end
function Widget:HasFocus() return self.focused end
function Widget:SetScale(value) self.scale = value end
function Widget:IsShown() return self.shown end
function Widget:Show()
    if not self.shown then self.shown = true; self:RunScript("OnShow") end
end
function Widget:Hide()
    if self.shown then self.shown = false; self:RunScript("OnHide") end
end
function Widget:SetShown(value) if value then self:Show() else self:Hide() end end
function Widget:Click()
    if self.kind == "CheckButton" then self.checked = not self.checked end
    return self:RunScript("OnClick", "LeftButton")
end
function Widget:CreateFontString(name, _, font)
    local widget = mock.Create("FontString", name, self)
    widget.font = font
    return widget
end

function mock.Create(kind, name, parent, template)
    local widget = setmetatable({
        id = #mock.widgets + 1,
        kind = kind, name = name, parent = parent, template = template,
        scripts = {}, events = {}, shown = true,
    }, Widget)
    mock.widgets[#mock.widgets + 1] = widget
    if name then _G[name] = widget end
    return widget
end

CreateFrame = mock.Create
UIParent = mock.Create("Frame", "UIParent")
UIParent:SetSize(1280, 900)
UISpecialFrames = {}
ChatEdit_InsertLink = function() return false end
hooksecurefunc = function(name, callback)
    mock.hooks[#mock.hooks + 1] = { name, callback }
    local original = _G[name]
    _G[name] = function(...)
        local result = original(...)
        callback(...)
        return result
    end
end

return mock
