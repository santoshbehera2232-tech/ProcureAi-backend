import express from 'express';
import { authController } from '../controllers/authController.js';
import {
  organizationController,
  supplierController,
  productController,
  requirementController,
  rfqController,
  quotationController,
  purchaseOrderController,
  shipmentController,
  deliveryController,
  invoiceController,
  anomalyController,
  analyticsController,
  documentController,
  notificationController,
  auditController
} from '../controllers/procurementController.js';
import { authenticate, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// ==========================================
// 1. AUTHENTICATION & SESSIONS
// ==========================================
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/logout', authController.logout);
router.post('/auth/refresh', authController.refreshToken);
router.get('/auth/me', authenticate, authController.getMe);
router.post('/auth/forgot-password', authController.forgotPassword);

// ==========================================
// 2. ORGANIZATIONS & SETTINGS
// ==========================================
router.get('/organizations/current', authenticate, organizationController.getOrganization);
router.patch('/organizations/weights', authenticate, authorizeRoles('Company Admin', 'Procurement Manager'), organizationController.updateWeights);

// ==========================================
// 3. SUPPLIER DIRECTORY & PORTAL
// ==========================================
router.get('/suppliers', authenticate, supplierController.getSuppliers);
router.get('/suppliers/:id', authenticate, supplierController.getSupplierById);
router.post('/suppliers', authenticate, authorizeRoles('Company Admin', 'Procurement Manager'), supplierController.createSupplier);
router.patch('/suppliers/:id', authenticate, supplierController.updateSupplier);

// ==========================================
// 4. PRODUCTS & CATEGORIES
// ==========================================
router.get('/products', authenticate, productController.getProducts);
router.post('/products', authenticate, authorizeRoles('Company Admin', 'Procurement Manager', 'Procurement Officer'), productController.createProduct);
router.get('/categories', authenticate, productController.getCategories);

// ==========================================
// 5. PURCHASE REQUIREMENTS
// ==========================================
router.get('/purchase-requirements', authenticate, requirementController.getRequirements);
router.get('/purchase-requirements/:id', authenticate, requirementController.getRequirementById);
router.post('/purchase-requirements', authenticate, requirementController.createRequirement);
router.patch('/purchase-requirements/:id/status', authenticate, authorizeRoles('Company Admin', 'Procurement Manager', 'Approver'), requirementController.updateStatus);

// ==========================================
// 6. REQUEST FOR QUOTATIONS (RFQs)
// ==========================================
router.get('/rfqs', authenticate, rfqController.getRFQs);
router.get('/rfqs/:id', authenticate, rfqController.getRFQById);
router.post('/rfqs', authenticate, authorizeRoles('Company Admin', 'Procurement Manager', 'Procurement Officer'), rfqController.createRFQ);

// ==========================================
// 7. QUOTATIONS & AI COMPARISON
// ==========================================
router.get('/quotations', authenticate, quotationController.getQuotations);
router.get('/quotations/:id', authenticate, quotationController.getQuotationById);
router.post('/quotations', authenticate, quotationController.submitQuotation);
router.get('/quotations/compare/:rfqId', authenticate, quotationController.compareAndAnalyze);
router.post('/quotations/:id/award', authenticate, authorizeRoles('Company Admin', 'Procurement Manager', 'Approver'), quotationController.awardQuotation);

// ==========================================
// 8. PURCHASE ORDERS & PDF GENERATION
// ==========================================
router.get('/purchase-orders', authenticate, purchaseOrderController.getPurchaseOrders);
router.get('/purchase-orders/:id', authenticate, purchaseOrderController.getPOById);
router.post('/purchase-orders/create-from-quotation', authenticate, authorizeRoles('Company Admin', 'Procurement Manager', 'Approver'), purchaseOrderController.createFromQuotation);
router.post('/purchase-orders/:id/acknowledge', authenticate, purchaseOrderController.acknowledgePO);
router.get('/purchase-orders/:id/pdf', authenticate, purchaseOrderController.downloadPDF);

// ==========================================
// 9. SHIPMENTS & LOGISTICS
// ==========================================
router.get('/shipments', authenticate, shipmentController.getShipments);
router.post('/shipments', authenticate, shipmentController.createShipment);
router.patch('/shipments/:id/location', authenticate, shipmentController.updateLocation);

// ==========================================
// 10. DELIVERIES & GOODS RECEIPT (GRN)
// ==========================================
router.get('/deliveries', authenticate, deliveryController.getGoodsReceipts);
router.post('/deliveries', authenticate, authorizeRoles('Company Admin', 'Warehouse Manager', 'Procurement Manager'), deliveryController.createGoodsReceipt);

// ==========================================
// 11. INVOICES & AI 3-WAY MATCHING
// ==========================================
router.get('/invoices', authenticate, invoiceController.getInvoices);
router.get('/invoices/:id', authenticate, invoiceController.getInvoiceById);
router.post('/invoices', authenticate, invoiceController.uploadAndVerify);
router.post('/invoices/:id/approve', authenticate, authorizeRoles('Company Admin', 'Finance Manager'), invoiceController.approveInvoice);

// ==========================================
// 12. DOCUMENTS VAULT
// ==========================================
router.get('/documents', authenticate, documentController.getDocuments);
router.get('/documents/:id/download', authenticate, documentController.downloadDocument);
router.post('/documents', authenticate, documentController.uploadDocument);

// ==========================================
// 13. PROCUREMENT ANALYTICS & AI INSIGHTS
// ==========================================
router.get('/analytics', authenticate, analyticsController.getDashboardAnalytics);
router.get('/anomalies', authenticate, anomalyController.getAnomalies);
router.get('/ai/insights', authenticate, anomalyController.getAIInsights);

// ==========================================
// 14. NOTIFICATIONS
// ==========================================
router.get('/notifications', authenticate, notificationController.getNotifications);
router.patch('/notifications/:id/read', authenticate, notificationController.markAsRead);
router.patch('/notifications/read-all', authenticate, notificationController.markAllAsRead);

// ==========================================
// 15. AUDIT LOGS
// ==========================================
router.get('/audit-logs', authenticate, authorizeRoles('Company Admin', 'Super Admin', 'Procurement Manager'), auditController.getAuditLogs);

export default router;
