import { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { useCart } from "../contexts/CartContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { Minus, Plus, Trash2, ShoppingBag, Package, Truck } from "lucide-react";
import CheckoutDialog from "./CheckoutDialog";
import { Badge } from "./ui/badge";

interface CartSidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function CartSidebar({ open, onClose }: CartSidebarProps) {
  const { t, language } = useLanguage();
  const { items, updateQuantity, removeItem, getTotalPrice, clearCart } =
    useCart();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const handleCheckout = () => {
    setIsCheckoutOpen(true);
  };

  const handleQuantityChange = (
    productId: string,
    variantId: string,
    newQuantity: number,
  ) => {
    if (newQuantity <= 0) {
      removeItem(productId, variantId);
    } else {
      updateQuantity(productId, variantId, newQuantity);
    }
  };

  const totalPrice = getTotalPrice();

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="w-[95vw] sm:max-w-lg max-h-[95vh] flex flex-col p-0 rounded-xl sm:rounded-xl border-0 shadow-2xl">
          <DialogHeader className="px-6 py-6 border-b bg-gradient-to-r from-primary/5 to-primary/10">
            <DialogTitle className="flex items-center gap-3 text-xl font-bold text-gray-800">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <ShoppingBag className="h-5 w-5 text-white" />
              </div>
              <span className="auto-text">{t("store.cart")}</span>
              {items.length > 0 && (
                <Badge variant="secondary" className="ml-auto bg-primary text-white">
                  {items.length}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center py-16 px-6">
              <div className="text-center space-y-6">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                  <ShoppingBag className="h-12 w-12 text-gray-400" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-gray-700 auto-text">
                    {t("store.cartEmpty")}
                  </h3>
                  <p className="text-gray-500 auto-text text-sm">
                    {language === "ar" 
                      ? "ابدأ التسوق لإضافة منتجات إلى سلتك" 
                      : "Start shopping to add products to your cart"
                    }
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={onClose}
                  className="px-8 py-3 h-auto"
                >
                  {t("store.continueShopping")}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1 px-6">
                <div className="space-y-6 py-6">
                  {items.map((item) => (
                    <div
                      key={`${item.productId}-${item.variantId}`}
                      className="group relative bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex gap-4">
                        {/* Product Image */}
                        {item.productImage && (
                          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                            <img
                              src={item.productImage}
                              alt={item.productName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        {/* Product Details */}
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-base sm:text-lg text-gray-900 truncate leading-tight">
                                {item.productName}
                              </h4>
                              {item.variantName && (
                                <p className="text-sm text-gray-600 mt-1">
                                  {item.variantName}
                                </p>
                              )}
                            </div>
                            
                            {/* Remove Button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                removeItem(item.productId, item.variantId)
                              }
                              className="shrink-0 h-8 w-8 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all duration-200"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Price and Quantity Controls */}
                          <div className="flex items-center justify-between">
                            <div className="text-lg font-bold text-primary">
                              {language === "ar" ? "د.ب " : "BD "}{item.price.toFixed(2)}
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleQuantityChange(
                                    item.productId,
                                    item.variantId,
                                    item.quantity - 1,
                                  )
                                }
                                className="h-8 w-8 p-0 border-gray-300 hover:border-primary hover:bg-primary/5"
                              >
                                <Minus className="h-3 w-3" />
                              </Button>

                              <Input
                                type="number"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleQuantityChange(
                                    item.productId,
                                    item.variantId,
                                    parseInt(e.target.value) || 1,
                                  )
                                }
                                min={1}
                                max={50}
                                className="w-16 h-8 text-center text-sm border-gray-300 focus:border-primary"
                              />

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleQuantityChange(
                                    item.productId,
                                    item.variantId,
                                    item.quantity + 1,
                                  )
                                }
                                className="h-8 w-8 p-0 border-gray-300 hover:border-primary hover:bg-primary/5"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          {/* Item Total */}
                          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                            <span className="text-sm text-gray-600 auto-text">
                              {language === "ar" ? "المجموع" : "Total"}:
                            </span>
                            <span className="text-lg font-bold text-gray-900">
                              {language === "ar" ? "د.ب " : "BD "}{(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <DialogFooter className="flex-col space-y-4 px-6 py-6 border-t bg-gray-50">
                {/* Summary */}
                <div className="w-full space-y-3">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span className="auto-text text-gray-700">{t("store.cartTotal")}:</span>
                    <span className="text-2xl font-bold text-primary">
                      {language === "ar" ? "د.ب " : "BD "}{totalPrice.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Package className="h-4 w-4" />
                    <span className="auto-text">
                      {items.length} {language === "ar" ? "منتج" : items.length === 1 ? "item" : "items"}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <Button
                    variant="outline"
                    onClick={clearCart}
                    className="flex-1 h-12 touch-manipulation border-gray-300 hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                    disabled={items.length === 0}
                  >
                    {t("store.clearCart")}
                  </Button>
                  <Button
                    onClick={handleCheckout}
                    className="flex-1 h-12 touch-manipulation bg-primary hover:bg-primary/90 shadow-lg"
                    disabled={items.length === 0}
                    size="lg"
                  >
                    <Truck className="h-4 w-4 mr-2" />
                    {t("store.checkout")}
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <CheckoutDialog
        open={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />
    </>
  );
}
