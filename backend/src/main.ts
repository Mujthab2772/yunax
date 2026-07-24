import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

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
import { createProductRoutes } from './modules/products/presentation/http/product.routes';

// Shared Services
import { NodemailerEmailService } from './infrastructure/notifications/NodemailerEmailService';

// User Module Imports
// import { InMemoryUserRepository } from './modules/users/infrastructure/repositories/InMemoryUserRepository';
import { PrismaUserRepository } from './modules/users/infrastructure/repositories/PrismaUserRepository';
import { BcryptPasswordHasher } from './modules/users/infrastructure/services/BcryptPasswordHasher';
import { JwtTokenService } from './modules/users/infrastructure/services/JwtTokenService';
import { RegisterUser } from './modules/users/application/use-cases/RegisterUser';
import { LoginUser } from './modules/users/application/use-cases/LoginUser';
import { GetUserProfile } from './modules/users/application/use-cases/GetUserProfile';
import { AuthController } from './modules/users/presentation/http/AuthController';
import { AuthMiddleware } from './modules/users/presentation/http/middleware/AuthMiddleware';
import { AdminMiddleware } from './modules/users/presentation/http/middleware/AdminMiddleware';
import { createAuthRoutes } from './modules/users/presentation/http/auth.routes';

// Cart Module Imports
// import { InMemoryCartRepository } from './modules/cart/infrastructure/repositories/InMemoryCartRepository';
import { PrismaCartRepository } from './modules/cart/infrastructure/repositories/PrismaCartRepository';
import { AddItemToCart } from './modules/cart/application/use-cases/AddItemToCart';
import { GetCartByUserId } from './modules/cart/application/use-cases/GetCartByUserId';
import { CartController } from './modules/cart/presentation/http/CartController';
import { createCartRoutes } from './modules/cart/presentation/http/cart.routes';

// Order Module Imports
// import { InMemoryOrderRepository } from './modules/orders/infrastructure/repositories/InMemoryOrderRepository';
import { PrismaOrderRepository } from './modules/orders/infrastructure/repositories/PrismaOrderRepository';
import { StripePaymentGateway } from './modules/orders/infrastructure/services/StripePaymentGateway';
import { PlaceOrder } from './modules/orders/application/use-cases/PlaceOrder';
import { GetOrderHistory } from './modules/orders/application/use-cases/GetOrderHistory';
import { HandlePaymentSuccess } from './modules/orders/application/use-cases/HandlePaymentSuccess';
import { OrderController } from './modules/orders/presentation/http/OrderController';
import { OrderWebhookController } from './modules/orders/presentation/http/OrderWebhookController';
import { createOrderRoutes } from './modules/orders/presentation/http/order.routes';

// Review Module Imports
import { PrismaReviewRepository } from './modules/reviews/infrastructure/repositories/PrismaReviewRepository';
import { AddReview } from './modules/reviews/application/use-cases/AddReview';
import { GetProductReviews } from './modules/reviews/application/use-cases/GetProductReviews';
import { ReviewController } from './modules/reviews/presentation/http/ReviewController';
import { createReviewRoutes } from './modules/reviews/presentation/http/review.routes';

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

import { ErrorHandler } from './infrastructure/middleware/ErrorHandler';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './infrastructure/docs/swagger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// 1. Shared Middlewares & Services
// ==========================================
const tokenService = new JwtTokenService();
const authMiddleware = new AuthMiddleware(tokenService);
const adminMiddleware = new AdminMiddleware();
const emailService = new NodemailerEmailService();

// ==========================================
// 2. User Module Dependency Wiring
// ==========================================
// const userRepository = new InMemoryUserRepository();
const userRepository = new PrismaUserRepository(); // <-- The Swap!
const passwordHasher = new BcryptPasswordHasher();

const registerUser = new RegisterUser(userRepository, passwordHasher);
const loginUser = new LoginUser(userRepository, passwordHasher, tokenService);
const getUserProfile = new GetUserProfile(userRepository);

const authController = new AuthController(registerUser, loginUser, getUserProfile);
const authRoutes = createAuthRoutes(authController, authMiddleware);

// ==========================================
// 3. Dependency Injection (Products)
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

// Create the router with the injected controller
const productRoutes = createProductRoutes(productController, authMiddleware, adminMiddleware);

// ==========================================
// 4. Cart Module Dependency Wiring
// ==========================================
const cartRepository = new PrismaCartRepository(); // <-- The Swap!
const getCartByUserId = new GetCartByUserId(cartRepository);
const addItemToCart = new AddItemToCart(cartRepository, productRepository);

const cartController = new CartController(getCartByUserId, addItemToCart);
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
const paymentGateway = new StripePaymentGateway();

const placeOrder = new PlaceOrder(orderRepository, cartRepository, productRepository, couponRepository, paymentGateway);
const getOrderHistory = new GetOrderHistory(orderRepository);
const handlePaymentSuccess = new HandlePaymentSuccess(orderRepository, decrementProductStock, userRepository, emailService, applyCouponToOrder);

const orderController = new OrderController(placeOrder, getOrderHistory);
const orderWebhookController = new OrderWebhookController(handlePaymentSuccess, paymentGateway);
const orderRoutes = createOrderRoutes(orderController, authMiddleware);

// ==========================================
// 7. Review Module Dependency Wiring
// ==========================================
const reviewRepository = new PrismaReviewRepository();
const addReview = new AddReview(reviewRepository, orderRepository);
const getProductReviews = new GetProductReviews(reviewRepository);

const reviewController = new ReviewController(addReview, getProductReviews);
const reviewRoutes = createReviewRoutes(reviewController, authMiddleware);

// ==========================================
// 8. Wishlist Module Dependency Wiring
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
// 10. Middleware & Route Registration
// ==========================================
app.use(cors({
  origin: 'http://localhost:3000', // Allow requests from frontend
  credentials: true,
}));

// Stripe webhook MUST be before express.json()
app.post('/api/v1/orders/webhook', express.raw({ type: 'application/json' }), orderWebhookController.handleEvent);

app.use(express.json());
// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Mount Routes
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/products/:id/reviews', reviewRoutes); // Nested route
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/wishlist', wishlistRoutes);
app.use('/api/v1/coupons', couponRoutes);
app.use('/api/v1/admin/analytics', analyticsRoutes);

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Global Error Handler
app.use(ErrorHandler);

// ==========================================
// 4. Server Start
// ==========================================
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
