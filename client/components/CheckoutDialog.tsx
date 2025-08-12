import { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { useData } from "../contexts/DataContext";
import { useCart } from "../contexts/CartContext";
import { createCustomer, createOrder } from "../services/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import {
  Check,
  CreditCard,
  Truck,
  Package,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { useEffect } from "react";

interface CheckoutDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function CheckoutDialog({ open, onClose }: CheckoutDialogProps) {
  const { t, language } = useLanguage();
  const { items, getTotalPrice, clearCart } = useCart();
  const { refetchData, getOrderNumber } = useData();

  const savedSettingsRaw = localStorage.getItem("storeSettings");
  const savedSettings = savedSettingsRaw ? JSON.parse(savedSettingsRaw) : {};
  const currencySymbol: string = savedSettings?.currencySymbol || "BD";
  const deliveryFeeSetting: number = Number(savedSettings?.deliveryFee ?? 1.5);
  const pickupAddress: string =
    language === "ar"
      ? savedSettings?.pickupAddressAr || "منزل 1348، طريق 416، مجمع 604، سترة القرية"
      : savedSettings?.pickupAddressEn || "Home 1348, Road 416, Block 604, Sitra Alqarya";
  const contactPhone: string = savedSettings?.contactPhone || "+973 36283382";

  // Get custom order messages from settings
  const getOrderMessages = () => {
    const savedSettings = localStorage.getItem("storeSettings");
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      return {
        successMessage:
          language === "ar"
            ? settings.orderSuccessMessageAr
            : settings.orderSuccessMessageEn,
        instructions:
          language === "ar"
            ? settings.orderInstructionsAr
            : settings.orderInstructionsEn,
        headline:
          language === "ar"
            ? settings.successHeadlineAr || "تم تأكيد الطلب!"
            : settings.successHeadlineEn || "Order Confirmed!",
        subtext:
          language === "ar"
            ? settings.successSubtextAr || "سنقوم بإبلاغك بالتحديثات عبر الهاتف حسب تقدم طلبك."
            : settings.successSubtextEn ||
              "We’ll share updates by phone as your order progresses.",
        toggles: {
          displayOrderNumber: settings.displayOrderNumber ?? true,
          displayOrderItems: settings.displayOrderItems ?? true,
          displayTotals: settings.displayTotals ?? true,
          displayNextSteps: settings.displayNextSteps ?? true,
          displayContact: settings.displayContact ?? true,
        },
      };
    }

    // Default messages if no custom settings
    return {
      successMessage:
        language === "ar"
          ? "شكراً لك على طلبك! سنقوم بتجهيزه خلال 2-4 ساعات وسيصل خلال 1-3 أيام عمل."
          : "Thank you for your order! We'll process it within 2-4 hours and deliver within 1-3 business days.",
      instructions:
        language === "ar"
          ? "لأي تغييرات أو أسئلة حول طلبك، يرجى التواصل معنا."
          : "For any changes or questions about your order, please contact us.",
      headline: language === "ar" ? "تم تأكيد الطلب!" : "Order Confirmed!",
      subtext:
        language === "ar"
          ? "سنقوم بإبلاغك بالتحديثات عبر الهاتف حسب تقدم طلبك."
          : "We’ll share updates by phone as your order progresses.",
      toggles: {
        displayOrderNumber: true,
        displayOrderItems: true,
        displayTotals: true,
        displayNextSteps: true,
        displayContact: true,
      },
    };
  };

  const [step, setStep] = useState(1);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    address: "", // For backward compatibility
    home: "",
    road: "",
    block: "",
    town: "",
  });

  const [deliveryType, setDeliveryType] = useState<"delivery" | "pickup">(
    "delivery",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [orderItems, setOrderItems] = useState<typeof items>([]);
  const [orderTotalPrice, setOrderTotalPrice] = useState(0);

  const totalPrice = getTotalPrice();

  const handleInputChange = (field: string, value: string) => {
    setCustomerInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const isStep1Valid = () => {
    return (
      customerInfo.name.trim() !== "" &&
      customerInfo.phone.trim() !== "" &&
      customerInfo.town.trim() !== "" // At minimum, town is required
    );
  };

  const isFormValid = () => {
    return isStep1Valid() && items.length > 0;
  };

  const handleNext = () => {
    if (step === 1 && isStep1Valid()) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handlePlaceOrder = async () => {
    if (!isFormValid()) return;

    setIsSubmitting(true);

    try {
      // Combine address fields into a single address string
      const addressParts = [
        customerInfo.home && `House ${customerInfo.home}`,
        customerInfo.road && `Road ${customerInfo.road}`,
        customerInfo.block && `Block ${customerInfo.block}`,
        customerInfo.town,
      ].filter(Boolean);

      const combinedAddress =
        addressParts.length > 0
          ? addressParts.join(", ")
          : customerInfo.address;

      // Create customer
      const customer = await createCustomer({
        name: customerInfo.name,
        phone: customerInfo.phone,
        address: combinedAddress,
      });

      // Prepare order items
      const orderItems = items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        price: item.price,
      }));

      // Calculate total including delivery fees
      const deliveryFee = deliveryType === "delivery" ? deliveryFeeSetting : 0;
      const orderTotal = totalPrice + deliveryFee;

      // Create order
      const order = await createOrder({
        customerId: customer.id,
        items: orderItems,
        total: orderTotal,
        status: "processing",
        deliveryType: deliveryType,
        notes: "",
      });

      // Success state - preserve order data before clearing cart
      setOrderItems([...items]);
      setOrderTotalPrice(totalPrice);

      // Calculate order number more reliably
      try {
        await refetchData(); // Refresh data first to get updated orders list
        const orderNum = getOrderNumber(order.id);
        setOrderNumber(orderNum > 0 ? orderNum.toString() : order.id.slice(-6));
      } catch (error) {
        // Fallback to using last 6 characters of order ID
        setOrderNumber(order.id.slice(-6));
      }

      setOrderSuccess(true);
      clearCart();
    } catch (error) {
      console.error("Error placing order:", error);
      alert(t("errors.orderFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setCustomerInfo({
      name: "",
      phone: "",
      address: "",
      home: "",
      road: "",
      block: "",
      town: "",
    });
    setDeliveryType("delivery");
    setOrderSuccess(false);
    setOrderNumber("");
    setOrderItems([]);
    setOrderTotalPrice(0);
    onClose();
  };

  const resetToStart = () => {
    setStep(1);
    setCustomerInfo({
      name: "",
      phone: "",
      address: "",
      home: "",
      road: "",
      block: "",
      town: "",
    });
    setDeliveryType("delivery");
    setOrderSuccess(false);
    setOrderNumber("");
    setOrderItems([]);
    setOrderTotalPrice(0);
  };

  // Success State
  if (orderSuccess) {
    const phoneEl = (
      <a href={`tel:${contactPhone}`} className="font-bold text-primary hover:underline">
        {contactPhone}
      </a>
    );
    const messages = getOrderMessages();

    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="w-[95vw] sm:max-w-lg max-h-[90vh] p-0 rounded-lg flex flex-col dialog-content-scroll">
          <ScrollArea className="flex-1 min-h-0 max-h-[80vh]">
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 pb-8">
              {/* Success Icon & Title */}
              <div className="text-center space-y-3">
                <div className="flex justify-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-10 h-10 text-green-600" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-green-600 auto-text">
                  {messages.headline}
                </h2>
                {messages.subtext && (
                  <p className="text-sm text-gray-600 auto-text">{messages.subtext}</p>
                )}
              </div>

              {/* Order Number */}
              {messages.toggles.displayOrderNumber && (
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-600 mb-2 auto-text">
                    {language === "ar" ? "رقم الطلب" : "Order Number"}
                  </p>
                  <Badge variant="outline" className="text-xl px-4 py-2 font-mono">
                    #{orderNumber}
                  </Badge>
                </div>
              )}

              {/* Order Summary */}
              {messages.toggles.displayTotals && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3 auto-text">
                    {language === "ar" ? "تفاصيل الطلب" : "Order Details"}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between [dir=rtl]:flex-row-reverse">
                      <span className="text-gray-600 auto-text">
                        {language === "ar" ? "العميل:" : "Customer:"}
                      </span>
                      <span className="font-medium auto-text">
                        {customerInfo.name}
                      </span>
                    </div>
                    <div className="flex justify-between [dir=rtl]:flex-row-reverse">
                      <span className="text-gray-600 auto-text">
                        {language === "ar" ? "الهاتف:" : "Phone:"}
                      </span>
                      <span className="font-medium ltr-text">
                        {customerInfo.phone}
                      </span>
                    </div>
                    <div className="flex justify-between [dir=rtl]:flex-row-reverse">
                      <span className="text-gray-600 auto-text">
                        {language === "ar" ? "المبلغ الإجمالي:" : "Total Amount:"}
                      </span>
                      <span className="font-bold text-primary ltr-text">
                        {currencySymbol}{" "}
                        {(
                          orderTotalPrice +
                          (deliveryType === "delivery" ? deliveryFeeSetting : 0)
                        ).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between [dir=rtl]:flex-row-reverse">
                      <span className="text-gray-600 auto-text">
                        {language === "ar" ? "الطريقة:" : "Method:"}
                      </span>
                      <span className="font-medium auto-text">
                        {deliveryType === "delivery"
                          ? language === "ar"
                            ? "توصيل"
                            : "Delivery"
                          : language === "ar"
                            ? "استلام"
                            : "Pickup"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Order Items */}
              {messages.toggles.displayOrderItems && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3 auto-text">
                    {language === "ar" ? "محتويات الطلب:" : "Order Items:"}
                  </h3>
                  <div className="space-y-2">
                    {orderItems.map((item, index) => (
                      <div
                        key={`${item.productId}-${item.variantId}-${index}`}
                        className="flex justify-between items-center p-2 bg-gray-50 rounded [dir=rtl]:flex-row-reverse"
                      >
                        <div className="flex items-center gap-2 [dir=rtl]:flex-row-reverse">
                          {item.productImage && (
                            <img
                              src={item.productImage}
                              alt={item.productName}
                              className="w-10 h-10 object-cover rounded"
                            />
                          )}
                          <div className="[dir=rtl]:text-right">
                            <p className="font-medium text-sm auto-text">
                              {item.productName}
                            </p>
                            {item.variantName && (
                              <p className="text-xs text-gray-600 auto-text">
                                {language === "ar" ? "النوع:" : "Variant:"}{" "}
                                {item.variantName}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right [dir=rtl]:text-left">
                          <p className="text-sm font-medium ltr-text">
                            {item.quantity} × {currencySymbol} {item.price.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-600 ltr-text">
                            {currencySymbol} {(item.quantity * item.price).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Subtotal */}
                  <div className="border-t pt-3 mt-3 space-y-2">
                    <div className="flex justify-between [dir=rtl]:flex-row-reverse">
                      <span className="text-gray-600 auto-text">
                        {language === "ar" ? "المجموع الفرعي:" : "Subtotal:"}
                      </span>
                      <span className="font-medium ltr-text">
                        {currencySymbol} {orderTotalPrice.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between [dir=rtl]:flex-row-reverse">
                      <span className="text-gray-600 auto-text">
                        {language === "ar" ? "رسوم التوصيل:" : "Delivery Fee:"}
                      </span>
                      <span className="font-medium ltr-text">
                        {deliveryType === "delivery"
                          ? `${currencySymbol} ${deliveryFeeSetting.toFixed(2)}`
                          : language === "ar" ? "مجاني" : "Free"}
                      </span>
                    </div>
                    <div className="flex justify-between [dir=rtl]:flex-row-reverse border-t pt-2">
                      <span className="font-bold auto-text">
                        {language === "ar" ? "المجموع الكلي:" : "Total:"}
                      </span>
                      <span className="font-bold text-primary ltr-text">
                        {currencySymbol}{" "}
                        {(orderTotalPrice + (deliveryType === "delivery" ? deliveryFeeSetting : 0)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Custom Success Message */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-green-800 auto-text leading-relaxed">
                  {getOrderMessages().successMessage}
                </p>
              </div>

              {/* Next Steps */}
              {messages.toggles.displayNextSteps && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-3 auto-text">
                    {language === "ar"
                      ? "ما هي الخطوات التالية؟"
                      : "What's Next?"}
                  </h3>
                  {deliveryType === "delivery" ? (
                    <div className="space-y-2 text-sm text-blue-800">
                      <div className="flex items-start gap-3 [dir=rtl]:flex-row-reverse [dir=rtl]:text-right">
                        <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
                          1
                        </div>
                        <p className="auto-text flex-1">
                          {language === "ar"
                            ? "سنقوم بتجهيز طلبك خلال 2-4 ساعات"
                            : "We'll process your order within 2-4 hours"}
                        </p>
                      </div>
                      <div className="flex items-start gap-3 [dir=rtl]:flex-row-reverse [dir=rtl]:text-right">
                        <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
                          2
                        </div>
                        <p className="auto-text flex-1">
                          {language === "ar"
                            ? "سيصل التوصيل خلال 1-3 أيام عمل"
                            : "Delivery will arrive in 1-3 business days"}
                        </p>
                      </div>
                      <div className="flex items-start gap-3 [dir=rtl]:flex-row-reverse [dir=rtl]:text-right">
                        <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
                          3
                        </div>
                        <p className="auto-text flex-1">
                          {language === "ar"
                            ? "سيتصل بك السائق عند الوصول"
                            : "Our driver will call you upon arrival"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 text-sm text-blue-800">
                      <div className="flex items-start gap-3 [dir=rtl]:flex-row-reverse [dir=rtl]:text-right">
                        <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
                          1
                        </div>
                        <p className="auto-text flex-1">
                          {language === "ar"
                            ? "سيكون طلبك جاهزاً للاستلام خلال يوم واحد"
                            : "Your order will be ready for pickup in 1 day"}
                        </p>
                      </div>
                      <div className="flex items-start gap-3 [dir=rtl]:flex-row-reverse [dir=rtl]:text-right">
                        <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
                          2
                        </div>
                        <div>
                          <p className="font-semibold auto-text">
                            {language === "ar" ? "عنوان الاستلام:" : "Pickup Address:"}
                          </p>
                          <p className="text-blue-700 auto-text">
                            {pickupAddress}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 [dir=rtl]:flex-row-reverse [dir=rtl]:text-right">
                        <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
                          3
                        </div>
                        <p className="auto-text flex-1">
                          {language === "ar" ? (
                            <>اتصل بـ {phoneEl} عند الوصول</>
                          ) : (
                            <>Call {phoneEl} when you arrive</>
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Contact Information */}
              {messages.toggles.displayContact && (
                <div className="border border-orange-200 bg-orange-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-orange-900 mb-2 auto-text [dir=rtl]:text-right">
                    {language === "ar" ? "تحتاج مساعدة؟" : "Need Help?"}
                  </h3>
                  <p className="text-sm text-orange-800 auto-text mb-2 [dir=rtl]:text-right">
                    {messages.instructions}
                  </p>
                  <p className="text-sm text-orange-700 auto-text [dir=rtl]:text-right">
                    {language === "ar" ? (
                      <>تواصل معنا على {phoneEl}</>
                    ) : (
                      <>Contact us at {phoneEl}</>
                    )}
                  </p>
                </div>
              )}

              {/* Action Button */}
              <Button onClick={handleClose} className="w-full" size="lg">
                <span className="auto-text">
                  {language === "ar" ? "متابعة التسوق" : "Continue Shopping"}
                </span>
              </Button>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] sm:max-w-lg max-h-[95vh] p-0 rounded-lg sm:rounded-md flex flex-col dialog-content-scroll">
        {/* Header */}
        <DialogHeader className="px-3 sm:px-6 py-3 sm:py-4 border-b flex-shrink-0">
          <DialogTitle className="text-lg sm:text-2xl font-bold text-center">
            {t("checkout.title")}
          </DialogTitle>

          {/* Step indicator */}
          <div className="flex justify-center mt-3 sm:mt-4">
            <div className="flex items-center space-x-2 sm:space-x-4 [dir=rtl]:space-x-reverse">
              {[1, 2, 3].map((stepNum) => (
                <div key={stepNum} className="flex items-center">
                  <div
                    className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${
                      step >= stepNum
                        ? "bg-primary text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {stepNum}
                  </div>
                  {stepNum < 3 && (
                    <div
                      className={`w-8 sm:w-12 h-0.5 mx-1 sm:mx-2 ${
                        step > stepNum ? "bg-primary" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Content Area */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-3 sm:p-6 pb-6 sm:pb-8 auto-text">
            {/* Step 1: Customer Information */}
            {step === 1 && (
              <Card className="border-2">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="flex items-center gap-2 [dir=rtl]:flex-row-reverse auto-text text-base sm:text-lg">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary text-white rounded-full flex items-center justify-center">
                      <span className="font-bold text-xs sm:text-sm">1</span>
                    </div>
                    <span className="auto-text">
                      {t("checkout.customerInfo")}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="name"
                        className="block auto-text text-sm sm:text-base"
                      >
                        {t("checkout.customerName")}
                      </Label>
                      <Input
                        id="name"
                        value={customerInfo.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        placeholder={t("checkout.customerName")}
                        className="auto-text h-11 sm:h-10 text-base touch-manipulation"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="phone"
                        className="block auto-text text-sm sm:text-base"
                      >
                        {t("checkout.customerPhone")}
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={customerInfo.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                        placeholder={t("checkout.customerPhone")}
                        className="ltr-text h-11 sm:h-10 text-base touch-manipulation"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="block auto-text text-sm sm:text-base">
                      {t("checkout.customerAddress")}
                    </Label>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        <div className="space-y-1">
                          <Label
                            htmlFor="home"
                            className="text-xs sm:text-sm text-gray-600 auto-text"
                          >
                            {t("checkout.customerHome")}
                          </Label>
                          <Input
                            id="home"
                            value={customerInfo.home}
                            onChange={(e) =>
                              handleInputChange("home", e.target.value)
                            }
                            placeholder="123"
                            className="text-center auto-text h-11 sm:h-10 touch-manipulation"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label
                            htmlFor="road"
                            className="text-xs sm:text-sm text-gray-600 auto-text"
                          >
                            {t("checkout.customerRoad")}
                          </Label>
                          <Input
                            id="road"
                            value={customerInfo.road}
                            onChange={(e) =>
                              handleInputChange("road", e.target.value)
                            }
                            placeholder="456"
                            className="text-center auto-text h-11 sm:h-10 touch-manipulation"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        <div className="space-y-1">
                          <Label
                            htmlFor="block"
                            className="text-xs sm:text-sm text-gray-600 auto-text"
                          >
                            {t("checkout.customerBlock")}
                          </Label>
                          <Input
                            id="block"
                            value={customerInfo.block}
                            onChange={(e) =>
                              handleInputChange("block", e.target.value)
                            }
                            placeholder="789"
                            className="text-center auto-text h-11 sm:h-10 touch-manipulation"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label
                            htmlFor="town"
                            className="text-xs sm:text-sm text-gray-600 auto-text"
                          >
                            {t("checkout.customerTown")}
                          </Label>
                          <Input
                            id="town"
                            value={customerInfo.town}
                            onChange={(e) =>
                              handleInputChange("town", e.target.value)
                            }
                            placeholder="Manama"
                            className="auto-text h-11 sm:h-10 touch-manipulation"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Delivery Options */}
            {step === 2 && (
              <Card className="border-2">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="flex items-center gap-2 [dir=rtl]:flex-row-reverse auto-text text-base sm:text-lg">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary text-white rounded-full flex items-center justify-center">
                      <span className="font-bold text-xs sm:text-sm">2</span>
                    </div>
                    <span className="auto-text">
                      {t("checkout.deliveryOptions")}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={deliveryType}
                    onValueChange={(value) =>
                      setDeliveryType(value as "delivery" | "pickup")
                    }
                    className="grid grid-cols-1 gap-3 sm:gap-4"
                  >
                    <div
                      className={`flex items-center space-x-3 [dir=rtl]:space-x-reverse p-4 sm:p-5 border-2 rounded-xl cursor-pointer transition-all touch-manipulation ${
                        deliveryType === "delivery"
                          ? "border-primary bg-primary/5"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => setDeliveryType("delivery")}
                      role="button"
                      tabIndex={0}
                    >
                      <RadioGroupItem value="delivery" id="delivery" />
                      <div className="flex items-center space-x-3 sm:space-x-4 [dir=rtl]:space-x-reverse flex-1">
                        <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
                        <div className="flex-1">
                          <Label
                            htmlFor="delivery"
                            className="text-sm sm:text-base font-medium cursor-pointer auto-text block"
                          >
                            {t("checkout.delivery")}
                          </Label>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`flex items-center space-x-3 [dir=rtl]:space-x-reverse p-4 sm:p-5 border-2 rounded-xl cursor-pointer transition-all touch-manipulation ${
                        deliveryType === "pickup"
                          ? "border-primary bg-primary/5"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => setDeliveryType("pickup")}
                      role="button"
                      tabIndex={0}
                    >
                      <RadioGroupItem value="pickup" id="pickup" />
                      <div className="flex items-center space-x-3 sm:space-x-4 [dir=rtl]:space-x-reverse flex-1">
                        <Package className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
                        <div className="flex-1">
                          <Label
                            htmlFor="pickup"
                            className="text-sm sm:text-base font-medium cursor-pointer auto-text block"
                          >
                            {t("checkout.pickup")}
                          </Label>
                        </div>
                      </div>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Order Summary & Payment */}
            {step === 3 && (
              <Card className="border-2">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="flex items-center gap-2 [dir=rtl]:flex-row-reverse auto-text text-base sm:text-lg">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary text-white rounded-full flex items-center justify-center">
                      <span className="font-bold text-xs sm:text-sm">3</span>
                    </div>
                    <span className="auto-text">
                      {t("checkout.orderSummary")}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                  {/* Customer Info Review */}
                  <div className="p-3 sm:p-4 bg-gray-50 rounded-lg space-y-3">
                    <h4 className="font-medium auto-text border-b border-gray-200 pb-2 text-sm sm:text-base">
                      {t("checkout.customerInfo")}
                    </h4>
                    <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                      <div className="flex justify-between items-start [dir=rtl]:flex-row-reverse gap-2">
                        <span className="font-medium text-gray-600 auto-text min-w-0">
                          {t("checkout.customerName")}:
                        </span>
                        <span className="font-medium auto-text text-end min-w-0 flex-1">
                          {customerInfo.name}
                        </span>
                      </div>
                      <div className="flex justify-between items-start [dir=rtl]:flex-row-reverse gap-2">
                        <span className="font-medium text-gray-600 auto-text min-w-0">
                          {t("checkout.customerPhone")}:
                        </span>
                        <span className="font-medium ltr-text text-end min-w-0 flex-1">
                          {customerInfo.phone}
                        </span>
                      </div>
                      <div className="flex justify-between items-start [dir=rtl]:flex-row-reverse gap-2">
                        <span className="font-medium text-gray-600 auto-text min-w-0">
                          {t("checkout.customerAddress")}:
                        </span>
                        <span className="font-medium auto-text text-end min-w-0 flex-1 leading-relaxed">
                          {language === "ar"
                            ? [
                                customerInfo.town,
                                customerInfo.block &&
                                  `مجمع ${customerInfo.block}`,
                                customerInfo.road &&
                                  `طريق ${customerInfo.road}`,
                                customerInfo.home &&
                                  `منزل ${customerInfo.home}`,
                              ]
                                .filter(Boolean)
                                .join("، ")
                            : [
                                customerInfo.home &&
                                  `House ${customerInfo.home}`,
                                customerInfo.road &&
                                  `Road ${customerInfo.road}`,
                                customerInfo.block &&
                                  `Block ${customerInfo.block}`,
                                customerInfo.town,
                              ]
                                .filter(Boolean)
                                .join(", ")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Items Review */}
                  <div className="space-y-3 sm:space-y-4">
                    <h4 className="font-medium auto-text border-b border-gray-200 pb-2 text-sm sm:text-base">
                      {t("checkout.orderItems")}
                    </h4>
                    <div className="space-y-2 sm:space-y-3">
                      {items.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-start [dir=rtl]:flex-row-reverse gap-2 sm:gap-3 py-2 sm:py-3 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium auto-text leading-relaxed text-sm sm:text-base">
                              {item.productName}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-500 auto-text mt-1">
                              {item.variantName} × {" "}
                              <span className="ltr-text">{item.quantity}</span>
                            </p>
                          </div>
                          <div className="text-end auto-text min-w-0">
                            <p className="font-medium ltr-text text-sm sm:text-lg">
                              {currencySymbol} {(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Total Calculation */}
                  <div className="space-y-3 bg-gray-50 p-3 sm:p-4 rounded-lg">
                    <div className="flex justify-between [dir=rtl]:flex-row-reverse items-center">
                      <span className="auto-text text-gray-600 text-sm sm:text-base">
                        {t("checkout.subtotal")}:
                      </span>
                      <span className="ltr-text font-medium text-sm sm:text-base">
                        {currencySymbol} {totalPrice.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between [dir=rtl]:flex-row-reverse items-center">
                      <span className="auto-text text-gray-600 text-sm sm:text-base">
                        {t("checkout.deliveryFee")}:
                      </span>
                      <span className="ltr-text font-medium text-sm sm:text-base">
                        {deliveryType === "delivery"
                          ? `${currencySymbol} ${deliveryFeeSetting.toFixed(2)}`
                          : `${currencySymbol} 0.00`}
                      </span>
                    </div>
                    <Separator className="my-2 sm:my-3" />
                    <div className="flex justify-between [dir=rtl]:flex-row-reverse items-center pt-2">
                      <span className="text-base sm:text-lg font-bold auto-text">
                        {t("checkout.total")}:
                      </span>
                      <span className="text-lg sm:text-xl font-bold text-primary ltr-text">
                        {currencySymbol}{" "}
                        {(totalPrice + (deliveryType === "delivery" ? deliveryFeeSetting : 0)).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200 mb-4">
                    <div className="flex items-center gap-3 [dir=rtl]:flex-row-reverse">
                      <CreditCard className="w-5 h-5 text-blue-600 [dir=rtl]:order-2 flex-shrink-0" />
                      <div className="[dir=rtl]:order-1 flex-1">
                        <p className="font-medium text-blue-900 auto-text text-sm sm:text-base">
                          {t("checkout.paymentMethod")}
                        </p>
                        <p className="text-xs sm:text-sm text-blue-700 auto-text">
                          {t("checkout.cashOnDelivery")}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>

        {/* Footer with Navigation - Fixed at bottom */}
        <div className="border-t p-3 sm:p-6 bg-white flex-shrink-0">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Back Button */}
            {step > 1 && (
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex items-center gap-2 h-11 sm:h-12 px-4 sm:px-6 touch-manipulation"
                size="sm"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">{t("common.back")}</span>
              </Button>
            )}

            {/* Next/Submit Button */}
            <div className="flex-1">
              {step < 3 ? (
                <Button
                  onClick={handleNext}
                  disabled={step === 1 && !isStep1Valid()}
                  className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 h-11 sm:h-12 w-full touch-manipulation"
                  size="lg"
                >
                  <span className="auto-text">{t("common.next")}</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              ) : (
                <Button
                  onClick={handlePlaceOrder}
                  disabled={!isFormValid() || isSubmitting}
                  className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 h-11 sm:h-12 w-full touch-manipulation"
                  size="lg"
                >
                  <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="auto-text">
                    {isSubmitting
                      ? t("common.loading")
                      : t("checkout.placeOrder")}
                  </span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
