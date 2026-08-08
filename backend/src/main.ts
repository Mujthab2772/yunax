import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';

// Import layers
import { PrismaProductRepository } from './modules/products/infrastructure/repositories/PrismaProductRepository';
import { CloudinaryUploader } from './modules/products/infrastructure/services/CloudinaryUploader';
import { ListProducts } from './modules/products/application/use-cases/ListProducts';
import { GetProductById } from './modules/products/application/use-cases/GetProductById';
import { CreateProduct } from './modules/products/application/use-cases/CreateProduct';
import { UpdateProduct } from './modules/products/application/use-cases/UpdateProduct';
import { DeleteProduct } from './modules/products/application/use-cases/DeleteProduct';
import { DecrementProductStock } from './modules/products/application/use-cases/DecrementProductStock';
import { ProductController } from './modules/products/presentation/http/ProductController';
import { UploadController } from './modules/products/presentation/http/UploadController';
import { createProductRoutes } from './modules/products/presentation/http/product.routes';

// Shared Services
import { NodemailerEmailService } from './infrastructure/notifications/NodemailerEmailService';

// User Module Imports
import { PrismaUserRepository } from './modules/users/infrastructure/repositories/PrismaUserRepository';
import { BcryptPasswordHasher } from './modules/users/infrastructure/services/BcryptPasswordHasher';
import { JwtTokenService } from './modules/users/infrastructure/services/JwtTokenService';
import { RegisterUser } from './modules/users/application/use-cases/RegisterUser';
import { LoginUser } from './modules/users/application/use-cases/LoginUser';
import { GetUserProfile } from './modules/users/application/use-cases/GetUserProfile';
import { ListUsers } from './modules/users/application/use-cases/ListUsers';
import { CreateUserByAdmin } from './modules/users/application/use-cases/CreateUserByAdmin';
import { UpdateUserByAdmin } from './modules/users/application/use-cases/UpdateUserByAdmin';
import { DeleteUser as DeleteAdminUser } from './modules/users/application/use-cases/DeleteUser';
import { AuthController } from './modules/users/presentation/http/AuthController';
import { AdminUserController } from './modules/users/presentation/http/AdminUserController';
import { createAuthRoutes } from './modules/users/presentation/http/auth.routes';
import { createAdminUserRoutes } from './modules/users/presentation/http/admin.user.routes';
import { AuthMiddleware } from './modules/users/presentation/http/middleware/AuthMiddleware';
import { AdminMiddleware } from './modules/users/presentation/http/middleware/AdminMiddleware';

// Cart Module Imports
// import { InMemoryCartRepository } from './modules/cart/infrastructure/repositories/InMemoryCartRepository';
import { PrismaCartRepository } from './modules/cart/infrastructure/repositories/PrismaCartRepository';
import { GetCartByUserId } from './modules/cart/application/use-cases/GetCartByUserId';
import { AddItemToCart } from './modules/cart/application/use-cases/AddItemToCart';
import { UpdateCartItemQuantity } from './modules/cart/application/use-cases/UpdateCartItemQuantity';
import { RemoveItemFromCart } from './modules/cart/application/use-cases/RemoveItemFromCart';
import { ClearCart } from './modules/cart/application/use-cases/ClearCart';
import { CartController } from './modules/cart/presentation/http/CartController';
import { createCartRoutes } from './modules/cart/presentation/http/cart.routes';

// Order Module Imports
// import { InMemoryOrderRepository } from './modules/orders/infrastructure/repositories/InMemoryOrderRepository';
import { PrismaOrderRepository } from './modules/orders/infrastructure/repositories/PrismaOrderRepository';
import { RazorpayPaymentGateway } from './modules/orders/infrastructure/services/RazorpayPaymentGateway';
import { PlaceOrder } from './modules/orders/application/use-cases/PlaceOrder';
import { GetOrderHistory } from './modules/orders/application/use-cases/GetOrderHistory';
import { GetAllOrders } from './modules/orders/application/use-cases/GetAllOrders';
import { UpdateOrderStatus } from './modules/orders/application/use-cases/UpdateOrderStatus';
import { CancelOrder } from './modules/orders/application/use-cases/CancelOrder';
import { DeleteOrder } from './modules/orders/application/use-cases/DeleteOrder';
import { GetOrderInvoice } from './modules/orders/application/use-cases/GetOrderInvoice';
import { HandlePaymentSuccess } from './modules/orders/application/use-cases/HandlePaymentSuccess';
import { OrderController } from './modules/orders/presentation/http/OrderController';
import { OrderWebhookController } from './modules/orders/presentation/http/OrderWebhookController';
import { createOrderRoutes } from './modules/orders/presentation/http/order.routes';

// Review Module Imports
import { PrismaReviewRepository } from './modules/reviews/infrastructure/repositories/PrismaReviewRepository';
import { AddReview } from './modules/reviews/application/use-cases/AddReview';
import { GetProductReviews } from './modules/reviews/application/use-cases/GetProductReviews';
import { ListAdminReviews } from './modules/reviews/application/use-cases/ListAdminReviews';
import { UpdateReviewStatus } from './modules/reviews/application/use-cases/UpdateReviewStatus';
import { DeleteReview } from './modules/reviews/application/use-cases/DeleteReview';
import { ReviewController } from './modules/reviews/presentation/http/ReviewController';
import { AdminReviewController } from './modules/reviews/presentation/http/AdminReviewController';
import { createReviewRoutes } from './modules/reviews/presentation/http/review.routes';
import { createAdminReviewRoutes } from './modules/reviews/presentation/http/admin.review.routes';

// Support Module Imports
import { PrismaSupportRepository } from './modules/support/infrastructure/repositories/PrismaSupportRepository';
import { CreateSupportMessage } from './modules/support/application/use-cases/CreateSupportMessage';
import { ListSupportMessages } from './modules/support/application/use-cases/ListSupportMessages';
import { GetUnreadSupportCount } from './modules/support/application/use-cases/GetUnreadSupportCount';
import { UpdateSupportStatus } from './modules/support/application/use-cases/UpdateSupportStatus';
import { SupportController } from './modules/support/presentation/http/SupportController';
import { createSupportRoutes } from './modules/support/presentation/http/support.routes';

// Wishlist Module Imports
import { PrismaWishlistRepository } from './modules/wishlist/infrastructure/repositories/PrismaWishlistRepository';
import { ToggleWishlist } from './modules/wishlist/application/use-cases/ToggleWishlist';
import { GetWishlist } from './modules/wishlist/application/use-cases/GetWishlist';
import { WishlistController } from './modules/wishlist/presentation/http/WishlistController';
import { createWishlistRoutes } from './modules/wishlist/presentation/http/wishlist.routes';

// Coupon Module Imports
import { PrismaCouponRepository } from './modules/coupons/infrastructure/repositories/PrismaCouponRepository';
import { ValidateCoupon } from './modules/coupons/application/use-cases/ValidateCoupon';
import { ApplyCouponToOrder } from './modules/coupons/application/use-cases/ApplyCouponToOrder';
import { CouponController } from './modules/coupons/presentation/http/CouponController';
import { createCouponRoutes } from './modules/coupons/presentation/http/coupon.routes';

// Analytics Module Imports
import { GetDashboardStats } from './modules/analytics/application/use-cases/GetDashboardStats';
import { AdminAnalyticsController } from './modules/analytics/presentation/http/AdminAnalyticsController';
import { createAnalyticsRoutes } from './modules/analytics/presentation/http/analytics.routes';

// Category Module Imports
import { PrismaCategoryRepository } from './modules/categories/infrastructure/repositories/PrismaCategoryRepository';
import { ListCategories } from './modules/categories/application/use-cases/ListCategories';
import { CreateCategory } from './modules/categories/application/use-cases/CreateCategory';
import { UpdateCategory } from './modules/categories/application/use-cases/UpdateCategory';
import { DeleteCategory } from './modules/categories/application/use-cases/DeleteCategory';
import { CategoryController } from './modules/categories/presentation/http/CategoryController';
import { createCategoryRoutes } from './modules/categories/presentation/http/category.routes';

import { ErrorHandler } from './infrastructure/middleware/ErrorHandler';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './infrastructure/docs/swagger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// 1. User & Auth Module Dependency Wiring
// ==========================================
const userRepository = new PrismaUserRepository();
const passwordHasher = new BcryptPasswordHasher();
const tokenService = new JwtTokenService();

import { ForgotPassword } from './modules/users/application/use-cases/ForgotPassword';
import { ResetPassword } from './modules/users/application/use-cases/ResetPassword';
import { VerifyResetOtp } from './modules/users/application/use-cases/VerifyResetOtp';

const registerUser = new RegisterUser(userRepository, passwordHasher, tokenService);
const loginUser = new LoginUser(userRepository, passwordHasher, tokenService);
const getUserProfile = new GetUserProfile(userRepository);
const emailService = new NodemailerEmailService();

const forgotPasswordUseCase = new ForgotPassword(userRepository, emailService);
const verifyResetOtpUseCase = new VerifyResetOtp(userRepository);
const resetPasswordUseCase = new ResetPassword(userRepository, passwordHasher);

const authController = new AuthController(
  registerUser, 
  loginUser, 
  getUserProfile, 
  forgotPasswordUseCase,
  verifyResetOtpUseCase,
  resetPasswordUseCase
);

const authMiddleware = new AuthMiddleware(tokenService);
const adminMiddleware = new AdminMiddleware();
const authRoutes = createAuthRoutes(authController, authMiddleware);

const listUsers = new ListUsers(userRepository);
const createUserByAdmin = new CreateUserByAdmin(userRepository, passwordHasher);
const updateUserByAdmin = new UpdateUserByAdmin(userRepository, passwordHasher);
const deleteAdminUser = new DeleteAdminUser(userRepository);
const adminUserController = new AdminUserController(listUsers, createUserByAdmin, updateUserByAdmin, deleteAdminUser);
const adminUserRoutes = createAdminUserRoutes(adminUserController, authMiddleware, adminMiddleware);

// ==========================================
// 2. Product Module Dependency Wiring
// ==========================================
// const productRepository = new InMemoryProductRepository();
const productRepository = new PrismaProductRepository(); // <-- The Swap!
const imageUploader = new CloudinaryUploader();

// Instantiate Application Use Cases
const listProducts = new ListProducts(productRepository);
const getProductById = new GetProductById(productRepository);
const createProduct = new CreateProduct(productRepository, imageUploader);
const updateProduct = new UpdateProduct(productRepository);
const deleteProduct = new DeleteProduct(productRepository);
const decrementProductStock = new DecrementProductStock(productRepository);

// Instantiate Presentation Controller
const productController = new ProductController(listProducts, getProductById, createProduct, updateProduct, deleteProduct);
const uploadController = new UploadController(imageUploader);

// Create the router with the injected controller
const productRoutes = createProductRoutes(productController, uploadController, authMiddleware, adminMiddleware);

// ==========================================
// 4. Cart Module Dependency Wiring
// ==========================================
const cartRepository = new PrismaCartRepository(); // <-- The Swap!
const getCartByUserId = new GetCartByUserId(cartRepository);
const addItemToCart = new AddItemToCart(cartRepository, productRepository);
const updateCartItemQuantity = new UpdateCartItemQuantity(cartRepository, productRepository);
const removeItemFromCart = new RemoveItemFromCart(cartRepository);
const clearCartUseCase = new ClearCart(cartRepository);

const cartController = new CartController(
  getCartByUserId, 
  addItemToCart, 
  updateCartItemQuantity, 
  removeItemFromCart, 
  clearCartUseCase
);
const cartRoutes = createCartRoutes(cartController, authMiddleware);

// ==========================================
// 5. Coupon Module Dependency Wiring
// ==========================================
const couponRepository = new PrismaCouponRepository();
const validateCoupon = new ValidateCoupon(couponRepository);
const applyCouponToOrder = new ApplyCouponToOrder(couponRepository);

const couponController = new CouponController(validateCoupon);
const couponRoutes = createCouponRoutes(couponController, authMiddleware);

// ==========================================
// 6. Order Module Dependency Wiring
// ==========================================
const orderRepository = new PrismaOrderRepository(); // <-- The Swap!
const paymentGateway = new RazorpayPaymentGateway();

const placeOrder = new PlaceOrder(orderRepository, cartRepository, productRepository, couponRepository, paymentGateway);
const getOrderHistory = new GetOrderHistory(orderRepository);
const getAllOrders = new GetAllOrders(orderRepository);
const updateOrderStatus = new UpdateOrderStatus(orderRepository, productRepository);
const cancelOrder = new CancelOrder(orderRepository, productRepository);
const deleteOrder = new DeleteOrder(orderRepository);
const getOrderInvoice = new GetOrderInvoice(orderRepository);
const handlePaymentSuccess = new HandlePaymentSuccess(orderRepository, decrementProductStock, userRepository, emailService, applyCouponToOrder);

const orderController = new OrderController(
  placeOrder,
  getOrderHistory,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  deleteOrder,
  getOrderInvoice,
  paymentGateway
);
const orderWebhookController = new OrderWebhookController(handlePaymentSuccess, paymentGateway);
const orderRoutes = createOrderRoutes(orderController, authMiddleware, adminMiddleware);

// ==========================================
// 7. Review Module Dependency Wiring
// ==========================================
const reviewRepository = new PrismaReviewRepository();
const addReview = new AddReview(reviewRepository, orderRepository);
const getProductReviews = new GetProductReviews(reviewRepository);
const listAdminReviews = new ListAdminReviews(reviewRepository);
const updateReviewStatus = new UpdateReviewStatus(reviewRepository);
const deleteReview = new DeleteReview(reviewRepository);

const reviewController = new ReviewController(addReview, getProductReviews);
const adminReviewController = new AdminReviewController(listAdminReviews, updateReviewStatus, deleteReview);

const reviewRoutes = createReviewRoutes(reviewController, authMiddleware);
const adminReviewRoutes = createAdminReviewRoutes(adminReviewController, authMiddleware, adminMiddleware);

// ==========================================
// 8. Support Module Dependency Wiring
// ==========================================
const supportRepository = new PrismaSupportRepository();
const createSupportMessage = new CreateSupportMessage(supportRepository);
const listSupportMessages = new ListSupportMessages(supportRepository);
const getUnreadSupportCount = new GetUnreadSupportCount(supportRepository);
const updateSupportStatus = new UpdateSupportStatus(supportRepository);
const supportController = new SupportController(createSupportMessage, listSupportMessages, getUnreadSupportCount, updateSupportStatus);
const supportRoutes = createSupportRoutes(supportController, authMiddleware, adminMiddleware);

// ==========================================
// 9. Wishlist Module Dependency Wiring
// ==========================================
const wishlistRepository = new PrismaWishlistRepository();
const toggleWishlist = new ToggleWishlist(wishlistRepository);
const getWishlist = new GetWishlist(wishlistRepository, productRepository);

const wishlistController = new WishlistController(toggleWishlist, getWishlist);
const wishlistRoutes = createWishlistRoutes(wishlistController, authMiddleware);

// ==========================================
// 9. Analytics Module Dependency Wiring
// ==========================================
const getDashboardStats = new GetDashboardStats(orderRepository, userRepository, productRepository);
const analyticsController = new AdminAnalyticsController(getDashboardStats);
const analyticsRoutes = createAnalyticsRoutes(analyticsController, authMiddleware, adminMiddleware);

// ==========================================
// 10. Category Module Dependency Wiring
// ==========================================
const categoryRepository = new PrismaCategoryRepository();
const listCategories = new ListCategories(categoryRepository);
const createCategory = new CreateCategory(categoryRepository);
const updateCategory = new UpdateCategory(categoryRepository);
const deleteCategory = new DeleteCategory(categoryRepository);

const categoryController = new CategoryController(listCategories, createCategory, updateCategory, deleteCategory);
const categoryRoutes = createCategoryRoutes(categoryController, authMiddleware, adminMiddleware);

// ==========================================
// 11. Middleware & Route Registration
// ==========================================
app.use(helmet());
app.use(cookieParser());

const allowedOrigins = process.env.FRONTEND_URL ? [process.env.FRONTEND_URL, 'http://localhost:5173'] : ['http://localhost:5173'];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Stripe webhook MUST be before express.json()
app.post('/api/v1/orders/webhook', express.raw({ type: 'application/json' }), orderWebhookController.handleEvent);

app.use(express.json());
// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Mount Routes
app.use('/auth', authRoutes);
app.use('/admin/users', adminUserRoutes);
app.use('/reviews', adminReviewRoutes);
app.use('/products', productRoutes);
app.use('/products/:id/reviews', reviewRoutes);
app.use('/orders', orderRoutes);
app.use('/wishlist', wishlistRoutes);
app.use('/cart', cartRoutes);
app.use('/coupons', couponRoutes);
app.use('/admin/analytics', analyticsRoutes);
app.use('/categories', categoryRoutes);
app.use('/support', supportRoutes);

if (process.env.NODE_ENV !== 'production') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

// Global Error Handler
app.use(ErrorHandler);

// ==========================================
// 4. Server Start
// ==========================================
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
