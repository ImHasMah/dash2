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
}

export default function Settings() {
  const { t, language } = useLanguage();
  const { showAlert, showConfirm } = useDialog();
  const [settings, setSettings] = useState<StoreSettings>({
    // Store Information
    storeName: "أزهار ستور - Azhar Store",
    storeDescription: "متجر أزهار للأجهزة الإلكترونية والإكسسوارات",
    currency: "BHD",
    currencySymbol: "BD",

    // Contact Information
    contactPhone: "+973 36283382",
    contactEmail: "info@azharstore.com",
    contactAddress: "منزل 1348، طريق 416، مجمع 604، سترة القرية، البحرين",

    // Order Messages
    orderSuccessMessageEn:
      "Thank you for your order! We'll process it within 2-4 hours and deliver within 1-3 business days.",
    orderSuccessMessageAr:
      "شكراً لك على طلبك! سنقوم بتجهيزه خلال 2-4 ساعات وسيصل خلال 1-3 أيام عمل.",
    orderInstructionsEn:
      "For any changes or questions about your order, please contact us.",
    orderInstructionsAr: "لأي تغييرات أو أسئلة حول طلبك، يرجى التواصل معنا.",

    // Business Hours
    businessHours: {
      monday: { open: "09:00", close: "22:00", isOpen: true },
      tuesday: { open: "09:00", close: "22:00", isOpen: true },
      wednesday: { open: "09:00", close: "22:00", isOpen: true },
      thursday: { open: "09:00", close: "22:00", isOpen: true },
      friday: { open: "14:00", close: "22:00", isOpen: true },
      saturday: { open: "09:00", close: "22:00", isOpen: true },
      sunday: { open: "09:00", close: "22:00", isOpen: true },
    },

    // Shipping & Delivery
    deliveryEnabled: true,
    pickupEnabled: true,
    deliveryFee: 1.5,
    freeDeliveryThreshold: 50,
    deliveryAreas: ["المنامة", "المحرق", "سترة", "عيسى", "الرفاع"],
    estimatedDeliveryTime: "1-3 أيام عمل",
    pickupAddressEn: "Home 1348, Road 416, Block 604, Sitra Alqarya",
    pickupAddressAr: "منزل 1348، طريق 416، مجمع 604، سترة القرية",

    // Payment Settings
    cashOnDeliveryEnabled: true,
    bankTransferEnabled: false,
    bankAccountInfo: "",

    // Operational Settings
    autoOrderConfirmation: true,
    lowStockThreshold: 5,
    maxOrderQuantity: 50,
    orderProcessingTime: "2-4 ساعات",
    deliveryConcerns: 24,
    pickupOrderConfig: 48,



    // Success Screen Controls
    successHeadlineEn: "Order Confirmed!",
    successHeadlineAr: "تم تأكيد الطلب!",
    successSubtextEn: "We’ll share updates by phone as your order progresses.",
    successSubtextAr: "سنقوم بإبلاغك بالتحديثات عبر الهاتف حسب تقدم طلبك.",
    displayOrderNumber: true,
    displayOrderItems: true,
    displayTotals: true,
    displayNextSteps: true,
    displayContact: true,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem("storeSettings");
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      // Merge with defaults to ensure all fields have values
      setSettings((prev) => ({
        ...prev,
        ...parsedSettings,
        // Ensure new fields have default values if missing
        deliveryConcerns: parsedSettings.deliveryConcerns ?? 24,
        pickupOrderConfig: parsedSettings.pickupOrderConfig ?? 48,
        pickupAddressEn:
          parsedSettings.pickupAddressEn ??
          "Home 1348, Road 416, Block 604, Sitra Alqarya",
        pickupAddressAr:
          parsedSettings.pickupAddressAr ??
          "منزل 1348، طريق 416، مجمع 604، سترة القرية",
        successHeadlineEn:
          parsedSettings.successHeadlineEn ?? "Order Confirmed!",
        successHeadlineAr:
          parsedSettings.successHeadlineAr ?? "تم تأكيد الطلب!",
        successSubtextEn:
          parsedSettings.successSubtextEn ??
          "We’ll share updates by phone as your order progresses.",
        successSubtextAr:
          parsedSettings.successSubtextAr ??
          "سنقوم بإبلاغك بالتحديثات عبر الهاتف حسب تقدم طلبك.",
        displayOrderNumber: parsedSettings.displayOrderNumber ?? true,
        displayOrderItems: parsedSettings.displayOrderItems ?? true,
        displayTotals: parsedSettings.displayTotals ?? true,
        displayNextSteps: parsedSettings.displayNextSteps ?? true,
        displayContact: parsedSettings.displayContact ?? true,
      }));
    }
  }, []);

  const handleInputChange = (field: string, value: any) => {
    // Ensure number fields are never undefined or NaN
    let processedValue = value;
    if (typeof value === "number" && (isNaN(value) || value === undefined)) {
      processedValue = 0;
    }

    setSettings((prev) => ({ ...prev, [field]: processedValue }));
    setHasChanges(true);
  };

  const handleBusinessHoursChange = (
    day: string,
    field: string,
    value: any,
  ) => {
    setSettings((prev) => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours[day as keyof typeof prev.businessHours],
          [field]: value,
        },
      },
    }));
    setHasChanges(true);
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // Save to localStorage (in production, this would be an API call)
      localStorage.setItem("storeSettings", JSON.stringify(settings));
      setHasChanges(false);

      // Show success message
      showAlert({
        title: t("common.success"),
        message: t("settings.saveSuccess"),
        type: "success",
      });
    } catch (error) {
      showAlert({
        title: t("message.error"),
        message: t("settings.saveError"),
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetSettings = async () => {
    const confirmed = await showConfirm({
      title: t("settings.reset"),
      message: t("settings.resetConfirm"),
      type: "warning",
    });

    if (confirmed) {
      localStorage.removeItem("storeSettings");
      window.location.reload();
    }
  };

  const days = [
    { key: "monday", name: t("settings.monday") },
    { key: "tuesday", name: t("settings.tuesday") },
    { key: "wednesday", name: t("settings.wednesday") },
    { key: "thursday", name: t("settings.thursday") },
    { key: "friday", name: t("settings.friday") },
    { key: "saturday", name: t("settings.saturday") },
    { key: "sunday", name: t("settings.sunday") },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3 [dir=rtl]:flex-row-reverse">
          <SettingsIcon className="w-6 h-6 sm:w-8 sm:h-8 text-dashboard-primary flex-shrink-0" />
          <div className="min-w-0">
            <h1 className="text-xl sm:text-3xl font-bold text-dashboard-primary auto-text leading-tight">
              {t("settings.title")}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 auto-text">
              {t("settings.subtitle")}
            </p>
          </div>
        </div>
        <div className="flex gap-2 [dir=rtl]:flex-row-reverse">
          <Button
            variant="outline"
            onClick={handleResetSettings}
            className="flex items-center gap-2 h-10 px-3 sm:px-4 text-sm touch-manipulation"
            size="sm"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="auto-text hidden sm:inline">
              {t("settings.reset")}
            </span>
          </Button>
          <Button
            onClick={handleSaveSettings}
            disabled={!hasChanges || isSaving}
            className="flex items-center gap-2 h-10 px-3 sm:px-4 text-sm touch-manipulation"
            size="sm"
          >
            <Save className="w-4 h-4" />
            <span className="auto-text">
              {isSaving ? t("common.loading") : t("settings.save")}
            </span>
          </Button>
        </div>
      </div>

      {hasChanges && (
        <div className="p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-lg mx-4 sm:mx-0">
          <p className="text-sm sm:text-base text-amber-800 auto-text">
            {t("settings.unsavedChanges")}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 px-4 sm:px-0">
        {/* Store Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 [dir=rtl]:flex-row-reverse auto-text">
              <Store className="w-5 h-5" />
              {t("settings.storeInformation")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="storeName" className="auto-text">
                {t("settings.storeName")}
              </Label>
              <Input
                id="storeName"
                value={settings.storeName}
                onChange={(e) => handleInputChange("storeName", e.target.value)}
                className="auto-text h-10 touch-manipulation"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="storeDescription" className="auto-text">
                {t("settings.storeDescription")}
              </Label>
              <Textarea
                id="storeDescription"
                value={settings.storeDescription}
                onChange={(e) =>
                  handleInputChange("storeDescription", e.target.value)
                }
                className="auto-text min-h-[80px] touch-manipulation"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="currency" className="auto-text">
                  {t("settings.currency")}
                </Label>
                <Select
                  value={settings.currency}
                  onValueChange={(value) =>
                    handleInputChange("currency", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BHD">
                      BHD - {t("settings.bahrainiDinar")}
                    </SelectItem>
                    <SelectItem value="USD">
                      USD - {t("settings.usDollar")}
                    </SelectItem>
                    <SelectItem value="EUR">
                      EUR - {t("settings.euro")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currencySymbol" className="auto-text">
                  {t("settings.currencySymbol")}
                </Label>
                <Input
                  id="currencySymbol"
                  value={settings.currencySymbol}
                  onChange={(e) =>
                    handleInputChange("currencySymbol", e.target.value)
                  }
                  className="auto-text h-10 touch-manipulation"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 [dir=rtl]:flex-row-reverse auto-text">
              <Phone className="w-5 h-5" />
              {t("settings.contactInformation")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contactPhone" className="auto-text">
                {t("settings.contactPhone")}
              </Label>
              <Input
                id="contactPhone"
                value={settings.contactPhone}
                onChange={(e) =>
                  handleInputChange("contactPhone", e.target.value)
                }
                className="ltr-text h-10 touch-manipulation"
                type="tel"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactEmail" className="auto-text">
                {t("settings.contactEmail")}
              </Label>
              <Input
                id="contactEmail"
                type="email"
                value={settings.contactEmail}
                onChange={(e) =>
                  handleInputChange("contactEmail", e.target.value)
                }
                className="ltr-text h-10 touch-manipulation"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactAddress" className="auto-text">
                {t("settings.contactAddress")}
              </Label>
              <Textarea
                id="contactAddress"
                value={settings.contactAddress}
                onChange={(e) =>
                  handleInputChange("contactAddress", e.target.value)
                }
                className="auto-text min-h-[80px] touch-manipulation"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Order Messages */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 [dir=rtl]:flex-row-reverse auto-text">
              <MessageSquare className="w-5 h-5" />
              {t("settings.orderMessages")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {/* English Messages */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 auto-text border-b border-gray-200 pb-2">
                  {t("settings.englishMessages")}
                </h4>
                <div className="space-y-2">
                  <Label htmlFor="orderSuccessMessageEn" className="auto-text">
                    {t("settings.orderSuccessMessage")}
                  </Label>
                  <Textarea
                    id="orderSuccessMessageEn"
                    value={settings.orderSuccessMessageEn}
                    onChange={(e) =>
                      handleInputChange("orderSuccessMessageEn", e.target.value)
                    }
                    className="ltr-text min-h-[80px] touch-manipulation"
                    rows={3}
                    placeholder="Thank you for your order! We'll process it within..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orderInstructionsEn" className="auto-text">
                    {t("settings.orderInstructions")}
                  </Label>
                  <Textarea
                    id="orderInstructionsEn"
                    value={settings.orderInstructionsEn}
                    onChange={(e) =>
                      handleInputChange("orderInstructionsEn", e.target.value)
                    }
                    className="ltr-text min-h-[60px] touch-manipulation"
                    rows={2}
                    placeholder="For any changes or questions..."
                  />
                </div>
              </div>

              {/* Arabic Messages */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 auto-text border-b border-gray-200 pb-2">
                  {t("settings.arabicMessages")}
                </h4>
                <div className="space-y-2">
                  <Label htmlFor="orderSuccessMessageAr" className="auto-text">
                    {t("settings.orderSuccessMessage")}
                  </Label>
                  <Textarea
                    id="orderSuccessMessageAr"
                    value={settings.orderSuccessMessageAr}
                    onChange={(e) =>
                      handleInputChange("orderSuccessMessageAr", e.target.value)
                    }
                    className="auto-text min-h-[80px] touch-manipulation"
                    rows={3}
                    placeholder="شكراً لك على طلبك! سنقوم بتجهيزه خلال..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orderInstructionsAr" className="auto-text">
                    {t("settings.orderInstructions")}
                  </Label>
                  <Textarea
                    id="orderInstructionsAr"
                    value={settings.orderInstructionsAr}
                    onChange={(e) =>
                      handleInputChange("orderInstructionsAr", e.target.value)
                    }
                    className="auto-text min-h-[60px] touch-manipulation"
                    rows={2}
                    placeholder="لأي تغييرات أو أسئلة..."
                  />
                </div>
              </div>
            </div>

            <div className="p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs sm:text-sm text-blue-800 auto-text leading-relaxed">
                <strong className="auto-text">{t("settings.note")}:</strong>{" "}
                {t("settings.orderMessageNote")}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Business Hours */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 [dir=rtl]:flex-row-reverse auto-text">
              <Clock className="w-5 h-5" />
              {t("settings.businessHours")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              {days.map((day) => (
                <div
                  key={day.key}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors space-y-3 sm:space-y-0 touch-manipulation"
                >
                  <div className="flex items-center gap-3 [dir=rtl]:flex-row-reverse">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={
                          settings.businessHours[
                            day.key as keyof typeof settings.businessHours
                          ].isOpen
                        }
                        onCheckedChange={(checked) =>
                          handleBusinessHoursChange(day.key, "isOpen", checked)
                        }
                        className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-300"
                      />
                    </div>
                    <span className="font-medium auto-text min-w-0">
                      {day.name}
                    </span>
                  </div>
                  {settings.businessHours[
                    day.key as keyof typeof settings.businessHours
                  ].isOpen && (
                    <div className="flex items-center gap-2 [dir=rtl]:flex-row-reverse">
                      <Input
                        type="time"
                        value={
                          settings.businessHours[
                            day.key as keyof typeof settings.businessHours
                          ].open
                        }
                        onChange={(e) =>
                          handleBusinessHoursChange(
                            day.key,
                            "open",
                            e.target.value,
                          )
                        }
                        className="w-20 sm:w-24 ltr-text text-sm h-10 touch-manipulation"
                      />
                      <span className="text-gray-500 text-sm">-</span>
                      <Input
                        type="time"
                        value={
                          settings.businessHours[
                            day.key as keyof typeof settings.businessHours
                          ].close
                        }
                        onChange={(e) =>
                          handleBusinessHoursChange(
                            day.key,
                            "close",
                            e.target.value,
                          )
                        }
                        className="w-20 sm:w-24 ltr-text text-sm h-10 touch-manipulation"
                      />
                    </div>
                  )}
                  {!settings.businessHours[
                    day.key as keyof typeof settings.businessHours
                  ].isOpen && (
                    <Badge variant="outline" className="auto-text text-xs">
                      {t("settings.closed")}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Shipping & Delivery */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 [dir=rtl]:flex-row-reverse auto-text">
              <Truck className="w-5 h-5" />
              {t("settings.shippingDelivery")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <Label
                htmlFor="deliveryEnabled"
                className="auto-text font-medium"
              >
                {t("settings.enableDelivery")}
              </Label>
              <Switch
                id="deliveryEnabled"
                checked={settings.deliveryEnabled}
                onCheckedChange={(checked) =>
                  handleInputChange("deliveryEnabled", checked)
                }
                className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-300"
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <Label htmlFor="pickupEnabled" className="auto-text font-medium">
                {t("settings.enablePickup")}
              </Label>
              <Switch
                id="pickupEnabled"
                checked={settings.pickupEnabled}
                onCheckedChange={(checked) =>
                  handleInputChange("pickupEnabled", checked)
                }
                className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-300"
              />
            </div>
            {settings.pickupEnabled && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="pickupAddressEn" className="auto-text">
                    {t("settings.pickupAddress")} (EN)
                  </Label>
                  <Input
                    id="pickupAddressEn"
                    value={settings.pickupAddressEn}
                    onChange={(e) =>
                      handleInputChange("pickupAddressEn", e.target.value)
                    }
                    className="auto-text h-10 touch-manipulation"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pickupAddressAr" className="auto-text">
                    {t("settings.pickupAddress")} (AR)
                  </Label>
                  <Input
                    id="pickupAddressAr"
                    value={settings.pickupAddressAr}
                    onChange={(e) =>
                      handleInputChange("pickupAddressAr", e.target.value)
                    }
                    className="auto-text h-10 touch-manipulation"
                  />
                </div>
              </div>
            )}
            <Separator />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="deliveryFee" className="auto-text">
                  {t("settings.deliveryFee")}
                </Label>
                <Input
                  id="deliveryFee"
                  type="number"
                  step="0.1"
                  value={settings.deliveryFee}
                  onChange={(e) =>
                    handleInputChange(
                      "deliveryFee",
                      parseFloat(e.target.value) || 0,
                    )
                  }
                  className="ltr-text h-10 touch-manipulation"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="freeDeliveryThreshold" className="auto-text">
                  {t("settings.freeDeliveryThreshold")}
                </Label>
                <Input
                  id="freeDeliveryThreshold"
                  type="number"
                  value={settings.freeDeliveryThreshold}
                  onChange={(e) =>
                    handleInputChange(
                      "freeDeliveryThreshold",
                      parseInt(e.target.value) || 0,
                    )
                  }
                  className="ltr-text h-10 touch-manipulation"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimatedDeliveryTime" className="auto-text">
                {t("settings.estimatedDeliveryTime")}
              </Label>
              <Input
                id="estimatedDeliveryTime"
                value={settings.estimatedDeliveryTime}
                onChange={(e) =>
                  handleInputChange("estimatedDeliveryTime", e.target.value)
                }
                className="auto-text h-10 touch-manipulation"
              />
            </div>
          </CardContent>
        </Card>

        {/* Payment Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 [dir=rtl]:flex-row-reverse auto-text">
              <CreditCard className="w-5 h-5" />
              {t("settings.paymentSettings")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <Label
                htmlFor="cashOnDeliveryEnabled"
                className="auto-text font-medium"
              >
                {t("settings.cashOnDelivery")}
              </Label>
              <Switch
                id="cashOnDeliveryEnabled"
                checked={settings.cashOnDeliveryEnabled}
                onCheckedChange={(checked) =>
                  handleInputChange("cashOnDeliveryEnabled", checked)
                }
                className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-300"
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <Label
                htmlFor="bankTransferEnabled"
                className="auto-text font-medium"
              >
                {t("settings.bankTransfer")}
              </Label>
              <Switch
                id="bankTransferEnabled"
                checked={settings.bankTransferEnabled}
                onCheckedChange={(checked) =>
                  handleInputChange("bankTransferEnabled", checked)
                }
                className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-300"
              />
            </div>
            {settings.bankTransferEnabled && (
              <div className="space-y-2">
                <Label htmlFor="bankAccountInfo" className="auto-text">
                  {t("settings.bankAccountInfo")}
                </Label>
                <Textarea
                  id="bankAccountInfo"
                  value={settings.bankAccountInfo}
                  onChange={(e) =>
                    handleInputChange("bankAccountInfo", e.target.value)
                  }
                  placeholder={t("settings.bankAccountPlaceholder")}
                  className="auto-text min-h-[80px] touch-manipulation"
                  rows={3}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Operational Settings */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 [dir=rtl]:flex-row-reverse auto-text">
              <SettingsIcon className="w-5 h-5" />
              {t("settings.operationalSettings")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg touch-manipulation">
                <Label
                  htmlFor="autoOrderConfirmation"
                  className="auto-text font-medium text-sm sm:text-base"
                >
                  {t("settings.autoOrderConfirmation")}
                </Label>
                <Switch
                  id="autoOrderConfirmation"
                  checked={settings.autoOrderConfirmation}
                  onCheckedChange={(checked) =>
                    handleInputChange("autoOrderConfirmation", checked)
                  }
                  className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-300"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lowStockThreshold" className="auto-text">
                    {t("settings.lowStockThreshold")}
                  </Label>
                  <Input
                    id="lowStockThreshold"
                    type="number"
                    value={settings.lowStockThreshold}
                    onChange={(e) =>
                      handleInputChange(
                        "lowStockThreshold",
                        parseInt(e.target.value) || 0,
                      )
                    }
                    className="ltr-text h-10 touch-manipulation"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxOrderQuantity" className="auto-text">
                    {t("settings.maxOrderQuantity")}
                  </Label>
                  <Input
                    id="maxOrderQuantity"
                    type="number"
                    value={settings.maxOrderQuantity}
                    onChange={(e) =>
                      handleInputChange(
                        "maxOrderQuantity",
                        parseInt(e.target.value) || 0,
                      )
                    }
                    className="ltr-text h-10 touch-manipulation"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deliveryConcerns" className="auto-text">
                    {t("settings.deliveryConcerns")}
                  </Label>
                  <Input
                    id="deliveryConcerns"
                    type="number"
                    value={settings.deliveryConcerns}
                    onChange={(e) =>
                      handleInputChange(
                        "deliveryConcerns",
                        parseInt(e.target.value) || 0,
                      )
                    }
                    className="ltr-text h-10 touch-manipulation"
                    placeholder="24"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pickupOrderConfig" className="auto-text">
                    {t("settings.pickupOrderConfig")}
                  </Label>
                  <Input
                    id="pickupOrderConfig"
                    type="number"
                    value={settings.pickupOrderConfig}
                    onChange={(e) =>
                      handleInputChange(
                        "pickupOrderConfig",
                        parseInt(e.target.value) || 0,
                      )
                    }
                    className="ltr-text h-10 touch-manipulation"
                    placeholder="48"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="orderProcessingTime" className="auto-text">
                {t("settings.orderProcessingTime")}
              </Label>
              <Input
                id="orderProcessingTime"
                value={settings.orderProcessingTime}
                onChange={(e) =>
                  handleInputChange("orderProcessingTime", e.target.value)
                }
                className="auto-text h-10 touch-manipulation"
              />
            </div>
          </CardContent>
        </Card>

        {/* Success Screen Controls */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 [dir=rtl]:flex-row-reverse auto-text">
              <SettingsIcon className="w-5 h-5" />
              {t("settings.successScreen")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="successHeadlineEn" className="auto-text">
                  {t("settings.successHeadline")} (EN)
                </Label>
                <Input
                  id="successHeadlineEn"
                  value={settings.successHeadlineEn}
                  onChange={(e) =>
                    handleInputChange("successHeadlineEn", e.target.value)
                  }
                  className="auto-text h-10 touch-manipulation"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="successHeadlineAr" className="auto-text">
                  {t("settings.successHeadline")} (AR)
                </Label>
                <Input
                  id="successHeadlineAr"
                  value={settings.successHeadlineAr}
                  onChange={(e) =>
                    handleInputChange("successHeadlineAr", e.target.value)
                  }
                  className="auto-text h-10 touch-manipulation"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="successSubtextEn" className="auto-text">
                  {t("settings.successSubtext")} (EN)
                </Label>
                <Input
                  id="successSubtextEn"
                  value={settings.successSubtextEn}
                  onChange={(e) =>
                    handleInputChange("successSubtextEn", e.target.value)
                  }
                  className="auto-text h-10 touch-manipulation"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="successSubtextAr" className="auto-text">
                  {t("settings.successSubtext")} (AR)
                </Label>
                <Input
                  id="successSubtextAr"
                  value={settings.successSubtextAr}
                  onChange={(e) =>
                    handleInputChange("successSubtextAr", e.target.value)
                  }
                  className="auto-text h-10 touch-manipulation"
                />
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <Label htmlFor="displayOrderNumber" className="auto-text">
                  {t("settings.displayOrderNumber")}
                </Label>
                <Switch
                  id="displayOrderNumber"
                  checked={!!settings.displayOrderNumber}
                  onCheckedChange={(checked) =>
                    handleInputChange("displayOrderNumber", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <Label htmlFor="displayOrderItems" className="auto-text">
                  {t("settings.displayOrderItems")}
                </Label>
                <Switch
                  id="displayOrderItems"
                  checked={!!settings.displayOrderItems}
                  onCheckedChange={(checked) =>
                    handleInputChange("displayOrderItems", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <Label htmlFor="displayTotals" className="auto-text">
                  {t("settings.displayTotals")}
                </Label>
                <Switch
                  id="displayTotals"
                  checked={!!settings.displayTotals}
                  onCheckedChange={(checked) =>
                    handleInputChange("displayTotals", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <Label htmlFor="displayNextSteps" className="auto-text">
                  {t("settings.displayNextSteps")}
                </Label>
                <Switch
                  id="displayNextSteps"
                  checked={!!settings.displayNextSteps}
                  onCheckedChange={(checked) =>
                    handleInputChange("displayNextSteps", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <Label htmlFor="displayContact" className="auto-text">
                  {t("settings.displayContact")}
                </Label>
                <Switch
                  id="displayContact"
                  checked={!!settings.displayContact}
                  onCheckedChange={(checked) =>
                    handleInputChange("displayContact", checked)
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
