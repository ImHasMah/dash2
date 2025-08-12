import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useDialog } from "@/contexts/DialogContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Store,
  CreditCard,
  Truck,
  Phone,
  Mail,
  MapPin,
  Clock,
  DollarSign,
  Settings as SettingsIcon,
  Save,
  RefreshCw,
  MessageSquare,
  Bell,
  Shield,
  User,
  Palette,
  Globe,
  Smartphone,
  Monitor,
  Zap,
  AlertTriangle,
  CheckCircle,
  Info,
  Download,
  Upload,
} from "lucide-react";

interface StoreSettings {
  // Store Information
  storeName: string;
  storeDescription: string;
  currency: string;
  currencySymbol: string;

  // Contact Information
  contactPhone: string;
  contactEmail: string;
  contactAddress: string;

  // Order Messages
  orderSuccessMessageEn: string;
  orderSuccessMessageAr: string;
  orderInstructionsEn: string;
  orderInstructionsAr: string;

  // Business Hours
  businessHours: {
    monday: { open: string; close: string; isOpen: boolean };
    tuesday: { open: string; close: string; isOpen: boolean };
    wednesday: { open: string; close: string; isOpen: boolean };
    thursday: { open: string; close: string; isOpen: boolean };
    friday: { open: string; close: string; isOpen: boolean };
    saturday: { open: string; close: string; isOpen: boolean };
    sunday: { open: string; close: string; isOpen: boolean };
  };

  // Shipping & Delivery
  deliveryEnabled: boolean;
  pickupEnabled: boolean;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  deliveryAreas: string[];
  estimatedDeliveryTime: string;
  pickupAddressEn?: string;
  pickupAddressAr?: string;

  // Payment Settings
  cashOnDeliveryEnabled: boolean;
  bankTransferEnabled: boolean;
  bankAccountInfo: string;

  // Operational Settings
  autoOrderConfirmation: boolean;
  lowStockThreshold: number;
  maxOrderQuantity: number;
  orderProcessingTime: string;
  deliveryConcerns: number;
  pickupOrderConfig: number;

  // Success Screen Controls
  successHeadlineEn?: string;
  successHeadlineAr?: string;
  successSubtextEn?: string;
  successSubtextAr?: string;
  displayOrderNumber?: boolean;
  displayOrderItems?: boolean;
  displayTotals?: boolean;
  displayNextSteps?: boolean;
  displayContact?: boolean;

  // UI Behavior
  enableDialogScroll?: boolean;
  autoScrollToSummary?: boolean;

  // Admin Settings
  adminPassword?: string;
  adminEmail?: string;

  // New Advanced Settings
  enableNotifications?: boolean;
  enableAnalytics?: boolean;
  enableBackup?: boolean;
  maxImageSize?: number;
  enableImageCompression?: boolean;
  enableAutoSave?: boolean;
  enableDarkMode?: boolean;
  enableAccessibility?: boolean;
  enablePerformanceMode?: boolean;
  enableDebugMode?: boolean;
}

export default function Settings() {
  const { t, language } = useLanguage();
  const { showDialog } = useDialog();
  const [settings, setSettings] = useState<StoreSettings>({
    storeName: "",
    storeDescription: "",
    currency: "BHD",
    currencySymbol: "BD",
    contactPhone: "",
    contactEmail: "",
    contactAddress: "",
    orderSuccessMessageEn: "Thank you for your order! We'll process it within 2-4 hours and deliver within 1-3 business days.",
    orderSuccessMessageAr: "شكراً لك على طلبك! سنقوم بمعالجته خلال 2-4 ساعات والتوصيل خلال 1-3 أيام عمل.",
    orderInstructionsEn: "For any changes or questions about your order, please contact us.",
    orderInstructionsAr: "لأي تغييرات أو أسئلة حول طلبك، يرجى التواصل معنا.",
    businessHours: {
      monday: { open: "09:00", close: "18:00", isOpen: true },
      tuesday: { open: "09:00", close: "18:00", isOpen: true },
      wednesday: { open: "09:00", close: "18:00", isOpen: true },
      thursday: { open: "09:00", close: "18:00", isOpen: true },
      friday: { open: "09:00", close: "18:00", isOpen: true },
      saturday: { open: "09:00", close: "18:00", isOpen: true },
      sunday: { open: "09:00", close: "18:00", isOpen: true },
    },
    deliveryEnabled: true,
    pickupEnabled: true,
    deliveryFee: 1.5,
    freeDeliveryThreshold: 50,
    deliveryAreas: ["All Towns", "Jao or Askar"],
    estimatedDeliveryTime: "1-3 business days",
    pickupAddressEn: "Home 1348, Road 416, Block 604, Sitra Alqarya",
    pickupAddressAr: "منزل 1348، طريق 416، مجمع 604، سترة القرية",
    cashOnDeliveryEnabled: true,
    bankTransferEnabled: false,
    bankAccountInfo: "",
    autoOrderConfirmation: true,
    lowStockThreshold: 5,
    maxOrderQuantity: 10,
    orderProcessingTime: "2-4 hours",
    deliveryConcerns: 1.5,
    pickupOrderConfig: 0,
    successHeadlineEn: "Order Confirmed!",
    successHeadlineAr: "تم تأكيد الطلب!",
    successSubtextEn: "We'll share updates by phone as your order progresses.",
    successSubtextAr: "سنقوم بإبلاغك بالتحديثات عبر الهاتف حسب تقدم طلبك.",
    displayOrderNumber: true,
    displayOrderItems: true,
    displayTotals: true,
    displayNextSteps: true,
    displayContact: true,
    enableDialogScroll: true,
    autoScrollToSummary: true,
    adminPassword: "",
    adminEmail: "",
    enableNotifications: true,
    enableAnalytics: true,
    enableBackup: true,
    maxImageSize: 5,
    enableImageCompression: true,
    enableAutoSave: true,
    enableDarkMode: false,
    enableAccessibility: true,
    enablePerformanceMode: false,
    enableDebugMode: false,
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const savedSettings = localStorage.getItem("storeSettings");
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings((prev) => ({ ...prev, ...parsed }));
    }
  }, []);

  const handleInputChange = (field: string, value: any) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleBusinessHoursChange = (day: string, field: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: { ...prev.businessHours[day as keyof typeof prev.businessHours], [field]: value },
      },
    }));
    setHasChanges(true);
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem("storeSettings", JSON.stringify(settings));
      setHasChanges(false);
      showDialog({
        title: t("settings.saveSuccess"),
        message: t("settings.saveSuccess"),
        type: "success",
      });
    } catch (error) {
      showDialog({
        title: t("settings.saveError"),
        message: t("settings.saveError"),
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const resetSettings = () => {
    showDialog({
      title: t("settings.reset"),
      message: t("settings.resetConfirm"),
      type: "confirm",
      onConfirm: () => {
        localStorage.removeItem("storeSettings");
        window.location.reload();
      },
    });
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'store-settings.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target?.result as string);
          setSettings((prev) => ({ ...prev, ...importedSettings }));
          setHasChanges(true);
          showDialog({
            title: t("checkout.settingsImported"),
            message: t("checkout.settingsImported"),
            type: "success",
          });
        } catch (error) {
          showDialog({
            title: t("checkout.importError"),
            message: t("checkout.importError"),
            type: "error",
          });
        }
      };
      reader.readAsText(file);
    }
  };

  const tabs = [
    { id: "basic", label: t("settings.basicSettings"), icon: Store },
    { id: "delivery", label: t("settings.deliverySettings"), icon: Truck },
    { id: "payment", label: t("settings.paymentSettings"), icon: CreditCard },
    { id: "messages", label: t("settings.messageSettings"), icon: MessageSquare },
         { id: "advanced", label: t("settings.advancedSettings"), icon: Zap },
    { id: "admin", label: t("settings.adminSettings"), icon: Shield },
  ];

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold auto-text">{t("settings.title")}</h1>
          <p className="text-muted-foreground auto-text">{t("settings.subtitle")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {hasChanges && (
            <Badge variant="destructive" className="auto-text">
              {t("settings.unsavedChanges")}
            </Badge>
          )}
          <Button 
            onClick={saveSettings} 
            disabled={!hasChanges || isSaving} 
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isSaving ? t("common.loading") : t("settings.save")}
          </Button>
          <Button variant="outline" onClick={resetSettings} className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            {t("settings.reset")}
          </Button>
        </div>
      </div>

      {/* Import/Export Section */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
                             <span className="auto-text text-sm font-medium">{t("checkout.backupRestore")}</span>
            </div>
            <div className="flex gap-2">
                             <Button variant="outline" size="sm" onClick={exportSettings} className="flex items-center gap-2">
                 <Download className="w-4 h-4" />
                 {t("checkout.export")}
               </Button>
              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={importSettings}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                                 <Button variant="outline" size="sm" className="flex items-center gap-2">
                   <Upload className="w-4 h-4" />
                   {t("checkout.import")}
                 </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 text-sm"
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </Button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Basic Settings */}
        {activeTab === "basic" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Store Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="w-5 h-5" />
                  {t("settings.storeInformation")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="storeName" className="auto-text">{t("settings.storeName")}</Label>
                  <Input
                    id="storeName"
                    value={settings.storeName}
                    onChange={(e) => handleInputChange("storeName", e.target.value)}
                    placeholder={t("settings.storeName")}
                    className="auto-text"
                  />
                </div>
                <div>
                  <Label htmlFor="storeDescription" className="auto-text">{t("settings.storeDescription")}</Label>
                  <Textarea
                    id="storeDescription"
                    value={settings.storeDescription}
                    onChange={(e) => handleInputChange("storeDescription", e.target.value)}
                    placeholder={t("settings.storeDescription")}
                    className="auto-text"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="currency" className="auto-text">{t("settings.currency")}</Label>
                    <Select value={settings.currency} onValueChange={(value) => handleInputChange("currency", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BHD">{t("settings.bahrainiDinar")}</SelectItem>
                        <SelectItem value="USD">{t("settings.usDollar")}</SelectItem>
                        <SelectItem value="EUR">{t("settings.euro")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="currencySymbol" className="auto-text">{t("settings.currencySymbol")}</Label>
                    <Input
                      id="currencySymbol"
                      value={settings.currencySymbol}
                      onChange={(e) => handleInputChange("currencySymbol", e.target.value)}
                      placeholder="BD"
                      className="ltr-text"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  {t("settings.contactInformation")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="contactPhone" className="auto-text">{t("settings.contactPhone")}</Label>
                  <Input
                    id="contactPhone"
                    value={settings.contactPhone}
                    onChange={(e) => handleInputChange("contactPhone", e.target.value)}
                    placeholder="+973 36283382"
                    className="ltr-text"
                  />
                </div>
                <div>
                  <Label htmlFor="contactEmail" className="auto-text">{t("settings.contactEmail")}</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                    placeholder="info@store.com"
                    className="ltr-text"
                  />
                </div>
                <div>
                  <Label htmlFor="contactAddress" className="auto-text">{t("settings.contactAddress")}</Label>
                  <Textarea
                    id="contactAddress"
                    value={settings.contactAddress}
                    onChange={(e) => handleInputChange("contactAddress", e.target.value)}
                    placeholder={t("settings.contactAddress")}
                    className="auto-text"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Delivery Settings */}
        {activeTab === "delivery" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Delivery Options */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  {t("settings.shippingDelivery")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="deliveryEnabled" className="auto-text">{t("settings.enableDelivery")}</Label>
                  <Switch
                    id="deliveryEnabled"
                    checked={settings.deliveryEnabled}
                    onCheckedChange={(checked) => handleInputChange("deliveryEnabled", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="pickupEnabled" className="auto-text">{t("settings.enablePickup")}</Label>
                  <Switch
                    id="pickupEnabled"
                    checked={settings.pickupEnabled}
                    onCheckedChange={(checked) => handleInputChange("pickupEnabled", checked)}
                  />
                </div>
                {settings.deliveryEnabled && (
                  <>
                    <div>
                      <Label htmlFor="deliveryFee" className="auto-text">{t("settings.deliveryFee")}</Label>
                      <Input
                        id="deliveryFee"
                        type="number"
                        step="0.01"
                        value={settings.deliveryFee}
                        onChange={(e) => handleInputChange("deliveryFee", parseFloat(e.target.value))}
                        className="ltr-text"
                      />
                    </div>
                    <div>
                      <Label htmlFor="freeDeliveryThreshold" className="auto-text">{t("settings.freeDeliveryThreshold")}</Label>
                      <Input
                        id="freeDeliveryThreshold"
                        type="number"
                        step="0.01"
                        value={settings.freeDeliveryThreshold}
                        onChange={(e) => handleInputChange("freeDeliveryThreshold", parseFloat(e.target.value))}
                        className="ltr-text"
                      />
                    </div>
                  </>
                )}
                {settings.pickupEnabled && (
                  <>
                    <div>
                      <Label htmlFor="pickupAddressEn" className="auto-text">Pickup Address (English)</Label>
                      <Textarea
                        id="pickupAddressEn"
                        value={settings.pickupAddressEn}
                        onChange={(e) => handleInputChange("pickupAddressEn", e.target.value)}
                        className="auto-text"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="pickupAddressAr" className="auto-text">عنوان الاستلام (العربية)</Label>
                      <Textarea
                        id="pickupAddressAr"
                        value={settings.pickupAddressAr}
                        onChange={(e) => handleInputChange("pickupAddressAr", e.target.value)}
                        className="auto-text"
                        rows={3}
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Business Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  {t("settings.businessHours")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(settings.businessHours).map(([day, hours]) => (
                  <div key={day} className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={hours.isOpen}
                        onCheckedChange={(checked) => handleBusinessHoursChange(day, "isOpen", checked)}
                      />
                      <Label className="auto-text min-w-20">
                        {t(`settings.${day}`)}
                      </Label>
                    </div>
                    {hours.isOpen && (
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={hours.open}
                          onChange={(e) => handleBusinessHoursChange(day, "open", e.target.value)}
                          className="w-24 ltr-text"
                        />
                        <span className="auto-text">-</span>
                        <Input
                          type="time"
                          value={hours.close}
                          onChange={(e) => handleBusinessHoursChange(day, "close", e.target.value)}
                          className="w-24 ltr-text"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Payment Settings */}
        {activeTab === "payment" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                {t("settings.paymentSettings")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="cashOnDeliveryEnabled" className="auto-text">{t("settings.cashOnDelivery")}</Label>
                <Switch
                  id="cashOnDeliveryEnabled"
                  checked={settings.cashOnDeliveryEnabled}
                  onCheckedChange={(checked) => handleInputChange("cashOnDeliveryEnabled", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="bankTransferEnabled" className="auto-text">{t("settings.bankTransfer")}</Label>
                <Switch
                  id="bankTransferEnabled"
                  checked={settings.bankTransferEnabled}
                  onCheckedChange={(checked) => handleInputChange("bankTransferEnabled", checked)}
                />
              </div>
              {settings.bankTransferEnabled && (
                <div>
                  <Label htmlFor="bankAccountInfo" className="auto-text">{t("settings.bankAccountInfo")}</Label>
                  <Textarea
                    id="bankAccountInfo"
                    value={settings.bankAccountInfo}
                    onChange={(e) => handleInputChange("bankAccountInfo", e.target.value)}
                    placeholder={t("settings.bankAccountPlaceholder")}
                    className="auto-text"
                    rows={4}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Message Settings */}
        {activeTab === "messages" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order Success Messages */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  {t("settings.orderSuccessMessage")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="orderSuccessMessageEn" className="auto-text">English</Label>
                  <Textarea
                    id="orderSuccessMessageEn"
                    value={settings.orderSuccessMessageEn}
                    onChange={(e) => handleInputChange("orderSuccessMessageEn", e.target.value)}
                    className="auto-text"
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="orderSuccessMessageAr" className="auto-text">العربية</Label>
                  <Textarea
                    id="orderSuccessMessageAr"
                    value={settings.orderSuccessMessageAr}
                    onChange={(e) => handleInputChange("orderSuccessMessageAr", e.target.value)}
                    className="auto-text"
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Success Screen Display Options */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  {t("settings.displayOptions")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="displayOrderNumber" className="auto-text">{t("settings.displayOrderNumber")}</Label>
                  <Switch
                    id="displayOrderNumber"
                    checked={settings.displayOrderNumber}
                    onCheckedChange={(checked) => handleInputChange("displayOrderNumber", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="displayOrderItems" className="auto-text">{t("settings.displayOrderItems")}</Label>
                  <Switch
                    id="displayOrderItems"
                    checked={settings.displayOrderItems}
                    onCheckedChange={(checked) => handleInputChange("displayOrderItems", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="displayTotals" className="auto-text">{t("settings.displayTotals")}</Label>
                  <Switch
                    id="displayTotals"
                    checked={settings.displayTotals}
                    onCheckedChange={(checked) => handleInputChange("displayTotals", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="displayNextSteps" className="auto-text">{t("settings.displayNextSteps")}</Label>
                  <Switch
                    id="displayNextSteps"
                    checked={settings.displayNextSteps}
                    onCheckedChange={(checked) => handleInputChange("displayNextSteps", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="displayContact" className="auto-text">{t("settings.displayContact")}</Label>
                  <Switch
                    id="displayContact"
                    checked={settings.displayContact}
                    onCheckedChange={(checked) => handleInputChange("displayContact", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Advanced Settings */}
        {activeTab === "advanced" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance & Optimization */}
            <Card>
              <CardHeader>
                               <CardTitle className="flex items-center gap-2">
                 <Zap className="w-5 h-5" />
                 {t("settings.performanceOptimization")}
               </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="enablePerformanceMode" className="auto-text">Performance Mode</Label>
                  <Switch
                    id="enablePerformanceMode"
                    checked={settings.enablePerformanceMode}
                    onCheckedChange={(checked) => handleInputChange("enablePerformanceMode", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="enableImageCompression" className="auto-text">Image Compression</Label>
                  <Switch
                    id="enableImageCompression"
                    checked={settings.enableImageCompression}
                    onCheckedChange={(checked) => handleInputChange("enableImageCompression", checked)}
                  />
                </div>
                <div>
                  <Label htmlFor="maxImageSize" className="auto-text">Max Image Size (MB)</Label>
                  <Input
                    id="maxImageSize"
                    type="number"
                    value={settings.maxImageSize}
                    onChange={(e) => handleInputChange("maxImageSize", parseInt(e.target.value))}
                    className="ltr-text"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="enableAutoSave" className="auto-text">Auto Save</Label>
                  <Switch
                    id="enableAutoSave"
                    checked={settings.enableAutoSave}
                    onCheckedChange={(checked) => handleInputChange("enableAutoSave", checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* User Experience */}
            <Card>
              <CardHeader>
                                 <CardTitle className="flex items-center gap-2">
                   <User className="w-5 h-5" />
                   {t("settings.userExperience")}
                 </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="enableDarkMode" className="auto-text">Dark Mode</Label>
                  <Switch
                    id="enableDarkMode"
                    checked={settings.enableDarkMode}
                    onCheckedChange={(checked) => handleInputChange("enableDarkMode", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="enableAccessibility" className="auto-text">Accessibility Features</Label>
                  <Switch
                    id="enableAccessibility"
                    checked={settings.enableAccessibility}
                    onCheckedChange={(checked) => handleInputChange("enableAccessibility", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="enableNotifications" className="auto-text">Notifications</Label>
                  <Switch
                    id="enableNotifications"
                    checked={settings.enableNotifications}
                    onCheckedChange={(checked) => handleInputChange("enableNotifications", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="enableAnalytics" className="auto-text">Analytics</Label>
                  <Switch
                    id="enableAnalytics"
                    checked={settings.enableAnalytics}
                    onCheckedChange={(checked) => handleInputChange("enableAnalytics", checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* System Settings */}
            <Card>
              <CardHeader>
                                 <CardTitle className="flex items-center gap-2">
                   <SettingsIcon className="w-5 h-5" />
                   {t("settings.systemSettings")}
                 </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="enableBackup" className="auto-text">Auto Backup</Label>
                  <Switch
                    id="enableBackup"
                    checked={settings.enableBackup}
                    onCheckedChange={(checked) => handleInputChange("enableBackup", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="enableDebugMode" className="auto-text">Debug Mode</Label>
                  <Switch
                    id="enableDebugMode"
                    checked={settings.enableDebugMode}
                    onCheckedChange={(checked) => handleInputChange("enableDebugMode", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="enableDialogScroll" className="auto-text">Dialog Scroll</Label>
                  <Switch
                    id="enableDialogScroll"
                    checked={settings.enableDialogScroll}
                    onCheckedChange={(checked) => handleInputChange("enableDialogScroll", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="autoScrollToSummary" className="auto-text">Auto Scroll to Summary</Label>
                  <Switch
                    id="autoScrollToSummary"
                    checked={settings.autoScrollToSummary}
                    onCheckedChange={(checked) => handleInputChange("autoScrollToSummary", checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Operational Settings */}
            <Card>
              <CardHeader>
                                 <CardTitle className="flex items-center gap-2">
                   <AlertTriangle className="w-5 h-5" />
                   {t("settings.operationalSettings")}
                 </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="autoOrderConfirmation" className="auto-text">Auto Order Confirmation</Label>
                  <Switch
                    id="autoOrderConfirmation"
                    checked={settings.autoOrderConfirmation}
                    onCheckedChange={(checked) => handleInputChange("autoOrderConfirmation", checked)}
                  />
                </div>
                <div>
                  <Label htmlFor="lowStockThreshold" className="auto-text">Low Stock Threshold</Label>
                  <Input
                    id="lowStockThreshold"
                    type="number"
                    value={settings.lowStockThreshold}
                    onChange={(e) => handleInputChange("lowStockThreshold", parseInt(e.target.value))}
                    className="ltr-text"
                  />
                </div>
                <div>
                  <Label htmlFor="maxOrderQuantity" className="auto-text">Max Order Quantity</Label>
                  <Input
                    id="maxOrderQuantity"
                    type="number"
                    value={settings.maxOrderQuantity}
                    onChange={(e) => handleInputChange("maxOrderQuantity", parseInt(e.target.value))}
                    className="ltr-text"
                  />
                </div>
                <div>
                  <Label htmlFor="orderProcessingTime" className="auto-text">Order Processing Time</Label>
                  <Input
                    id="orderProcessingTime"
                    value={settings.orderProcessingTime}
                    onChange={(e) => handleInputChange("orderProcessingTime", e.target.value)}
                    className="auto-text"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Admin Settings */}
        {activeTab === "admin" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                {t("settings.adminSettings")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="adminEmail" className="auto-text">{t("settings.adminEmail")}</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  value={settings.adminEmail}
                  onChange={(e) => handleInputChange("adminEmail", e.target.value)}
                  placeholder="admin@store.com"
                  className="ltr-text"
                />
              </div>
              <div>
                <Label htmlFor="adminPassword" className="auto-text">{t("settings.adminPassword")}</Label>
                <Input
                  id="adminPassword"
                  type="password"
                  value={settings.adminPassword}
                  onChange={(e) => handleInputChange("adminPassword", e.target.value)}
                  placeholder="••••••••"
                  className="ltr-text"
                />
                <p className="text-sm text-muted-foreground auto-text mt-1">
                  {t("settings.adminPasswordHint")}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
