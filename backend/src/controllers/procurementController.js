import { dbService } from '../services/dbService.js';
import { supplierService } from '../services/supplierService.js';
import { productService } from '../services/productService.js';
import { requirementService } from '../services/requirementService.js';
import { rfqService } from '../services/rfqService.js';
import { quotationService } from '../services/quotationService.js';
import { aiAnalysisService } from '../services/aiAnalysisService.js';
import { purchaseOrderService } from '../services/purchaseOrderService.js';
import { pdfService } from '../services/pdfService.js';
import { shipmentService } from '../services/shipmentService.js';
import { deliveryService } from '../services/deliveryService.js';
import { invoiceService } from '../services/invoiceService.js';
import { anomalyService } from '../services/anomalyService.js';
import { analyticsService } from '../services/analyticsService.js';
import { documentService } from '../services/documentService.js';
import { notificationService } from '../services/notificationService.js';
import { auditService } from '../services/auditService.js';

export const organizationController = {
  async getOrganization(req, res, next) {
    try {
      const org = await dbService.findOne('organizations', { id: req.user.organization_id });
      res.json({ success: true, data: org });
    } catch (e) { next(e); }
  },

  async updateWeights(req, res, next) {
    try {
      const { weights } = req.body;
      const updated = await dbService.update('organizations', req.user.organization_id, { scoring_weights: weights });
      res.json({ success: true, message: 'Scoring weights updated', data: updated });
    } catch (e) { next(e); }
  }
};

export const supplierController = {
  async getSuppliers(req, res, next) {
    try {
      const suppliers = await supplierService.getSuppliers(req.user.organization_id, req.query);
      res.json({ success: true, data: suppliers });
    } catch (e) { next(e); }
  },

  async getSupplierById(req, res, next) {
    try {
      const supplier = await supplierService.getSupplierById(req.params.id, req.user.organization_id);
      res.json({ success: true, data: supplier });
    } catch (e) { next(e); }
  },

  async createSupplier(req, res, next) {
    try {
      const supplier = await supplierService.createSupplier(req.body, req.user);
      res.status(201).json({ success: true, message: 'Supplier registered successfully', data: supplier });
    } catch (e) { next(e); }
  },

  async updateSupplier(req, res, next) {
    try {
      const updated = await supplierService.updateSupplier(req.params.id, req.body, req.user);
      res.json({ success: true, message: 'Supplier profile updated', data: updated });
    } catch (e) { next(e); }
  }
};

export const productController = {
  async getProducts(req, res, next) {
    try {
      const products = await productService.getProducts(req.user.organization_id);
      res.json({ success: true, data: products });
    } catch (e) { next(e); }
  },

  async getCategories(req, res, next) {
    try {
      const categories = await productService.getCategories(req.user.organization_id);
      res.json({ success: true, data: categories });
    } catch (e) { next(e); }
  },

  async createProduct(req, res, next) {
    try {
      const product = await productService.createProduct(req.body, req.user);
      res.status(201).json({ success: true, message: 'Product item created', data: product });
    } catch (e) { next(e); }
  }
};

export const requirementController = {
  async getRequirements(req, res, next) {
    try {
      const list = await requirementService.getRequirements(req.user.organization_id);
      res.json({ success: true, data: list });
    } catch (e) { next(e); }
  },

  async getRequirementById(req, res, next) {
    try {
      const reqItem = await requirementService.getRequirementById(req.params.id, req.user.organization_id);
      res.json({ success: true, data: reqItem });
    } catch (e) { next(e); }
  },

  async createRequirement(req, res, next) {
    try {
      const created = await requirementService.createRequirement(req.body, req.user);
      res.status(201).json({ success: true, message: 'Purchase requirement submitted', data: created });
    } catch (e) { next(e); }
  },

  async updateStatus(req, res, next) {
    try {
      const updated = await requirementService.updateStatus(req.params.id, req.body, req.user);
      res.json({ success: true, message: `Requirement status updated to ${req.body.status}`, data: updated });
    } catch (e) { next(e); }
  }
};

export const rfqController = {
  async getRFQs(req, res, next) {
    try {
      const list = await rfqService.getRFQs(req.user.organization_id, req.query);
      res.json({ success: true, data: list });
    } catch (e) { next(e); }
  },

  async getRFQById(req, res, next) {
    try {
      const rfq = await rfqService.getRFQById(req.params.id, req.user.organization_id);
      res.json({ success: true, data: rfq });
    } catch (e) { next(e); }
  },

  async createRFQ(req, res, next) {
    try {
      const rfq = await rfqService.createRFQ(req.body, req.user);
      res.status(201).json({ success: true, message: 'RFQ created and published to invited suppliers', data: rfq });
    } catch (e) { next(e); }
  }
};

export const quotationController = {
  async getQuotations(req, res, next) {
    try {
      const filter = {};
      if (req.query.rfq_id) filter.rfq_id = req.query.rfq_id;
      if (req.user.is_supplier && req.user.supplier_id) filter.supplier_id = req.user.supplier_id;
      const list = await quotationService.getQuotations(filter);
      res.json({ success: true, data: list });
    } catch (e) { next(e); }
  },

  async getQuotationById(req, res, next) {
    try {
      const quote = await quotationService.getQuotationById(req.params.id);
      res.json({ success: true, data: quote });
    } catch (e) { next(e); }
  },

  async submitQuotation(req, res, next) {
    try {
      const quote = await quotationService.submitQuotation(req.body, req.user);
      res.status(201).json({ success: true, message: 'Quotation submitted successfully', data: quote });
    } catch (e) { next(e); }
  },

  async compareAndAnalyze(req, res, next) {
    try {
      const rfqId = req.params.rfqId || req.query.rfq_id;
      const analysis = await aiAnalysisService.analyzeQuotations(rfqId, req.user.organization_id);
      res.json({ success: true, data: analysis });
    } catch (e) { next(e); }
  },

  async awardQuotation(req, res, next) {
    try {
      const quote = await quotationService.awardQuotation(req.params.id, req.user);
      res.json({ success: true, message: 'Quotation awarded. Ready for Purchase Order generation.', data: quote });
    } catch (e) { next(e); }
  }
};

export const purchaseOrderController = {
  async getPurchaseOrders(req, res, next) {
    try {
      const filter = {};
      if (req.user.is_supplier && req.user.supplier_id) filter.supplier_id = req.user.supplier_id;
      const list = await purchaseOrderService.getPurchaseOrders(req.user.organization_id, filter);
      res.json({ success: true, data: list });
    } catch (e) { next(e); }
  },

  async getPOById(req, res, next) {
    try {
      const po = await purchaseOrderService.getPOById(req.params.id, req.user.organization_id);
      res.json({ success: true, data: po });
    } catch (e) { next(e); }
  },

  async createFromQuotation(req, res, next) {
    try {
      const { quotation_id } = req.body;
      const po = await purchaseOrderService.createPOFromQuotation(quotation_id, req.user);
      res.status(201).json({ success: true, message: 'Purchase Order generated and approved', data: po });
    } catch (e) { next(e); }
  },

  async acknowledgePO(req, res, next) {
    try {
      const po = await purchaseOrderService.acknowledgePO(req.params.id, req.user);
      res.json({ success: true, message: 'Purchase Order acknowledged by vendor', data: po });
    } catch (e) { next(e); }
  },

  async downloadPDF(req, res, next) {
    try {
      const po = await purchaseOrderService.getPOById(req.params.id, req.user.organization_id);
      const pdfBuffer = await pdfService.generatePOReceiptPDF(po, po.supplier, po.organization);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${po.po_number}.pdf"`);
      res.send(pdfBuffer);
    } catch (e) { next(e); }
  }
};

export const shipmentController = {
  async getShipments(req, res, next) {
    try {
      const list = await shipmentService.getShipments(req.user.organization_id, req.query);
      res.json({ success: true, data: list });
    } catch (e) { next(e); }
  },

  async createShipment(req, res, next) {
    try {
      const shipment = await shipmentService.createShipment(req.body, req.user);
      res.status(201).json({ success: true, message: 'Shipment dispatched successfully', data: shipment });
    } catch (e) { next(e); }
  },

  async updateLocation(req, res, next) {
    try {
      const updated = await shipmentService.updateShipmentLocation(req.params.id, req.body, req.user);
      res.json({ success: true, message: 'Tracking details updated', data: updated });
    } catch (e) { next(e); }
  }
};

export const deliveryController = {
  async getGoodsReceipts(req, res, next) {
    try {
      const list = await deliveryService.getGoodsReceipts(req.user.organization_id, req.query);
      res.json({ success: true, data: list });
    } catch (e) { next(e); }
  },

  async createGoodsReceipt(req, res, next) {
    try {
      const grn = await deliveryService.createGoodsReceipt(req.body, req.user);
      res.status(201).json({ success: true, message: 'Goods Receipt Note (GRN) registered successfully', data: grn });
    } catch (e) { next(e); }
  }
};

export const invoiceController = {
  async getInvoices(req, res, next) {
    try {
      const list = await invoiceService.getInvoices(req.user.organization_id, req.query);
      res.json({ success: true, data: list });
    } catch (e) { next(e); }
  },

  async getInvoiceById(req, res, next) {
    try {
      const inv = await invoiceService.getInvoiceById(req.params.id, req.user.organization_id);
      res.json({ success: true, data: inv });
    } catch (e) { next(e); }
  },

  async uploadAndVerify(req, res, next) {
    try {
      const invoice = await invoiceService.createAndVerifyInvoice(req.body, req.user);
      res.status(201).json({ success: true, message: 'Invoice submitted and AI 3-Way Verified', data: invoice });
    } catch (e) { next(e); }
  },

  async approveInvoice(req, res, next) {
    try {
      const approved = await invoiceService.approveInvoice(req.params.id, req.user);
      res.json({ success: true, message: 'Invoice approved by Finance for payment execution', data: approved });
    } catch (e) { next(e); }
  }
};

export const anomalyController = {
  async getAnomalies(req, res, next) {
    try {
      const list = await anomalyService.getAnomalies(req.user.organization_id);
      res.json({ success: true, data: list });
    } catch (e) { next(e); }
  },

  async getAIInsights(req, res, next) {
    try {
      const list = await anomalyService.getAIInsights(req.user.organization_id);
      res.json({ success: true, data: list });
    } catch (e) { next(e); }
  }
};

export const analyticsController = {
  async getDashboardAnalytics(req, res, next) {
    try {
      const analytics = await analyticsService.getDashboardAnalytics(req.user.organization_id);
      res.json({ success: true, data: analytics });
    } catch (e) { next(e); }
  }
};

export const documentController = {
  async getDocuments(req, res, next) {
    try {
      const list = await documentService.getDocuments(req.user.organization_id, req.query);
      res.json({ success: true, data: list });
    } catch (e) { next(e); }
  },

  async uploadDocument(req, res, next) {
    try {
      const doc = await documentService.uploadDocument(req.body, req.user);
      res.status(201).json({ success: true, message: 'Document uploaded to secure vault', data: doc });
    } catch (e) { next(e); }
  },

  async downloadDocument(req, res, next) {
    try {
      const doc = await dbService.findOne('documents', { id: req.params.id });
      if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
      const org = await dbService.findOne('organizations', { id: doc.organization_id });
      const pdfBuffer = await pdfService.generateDocumentPDF(doc, org);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${doc.file_name || 'certificate.pdf'}"`);
      res.send(pdfBuffer);
    } catch (e) { next(e); }
  }
};

export const notificationController = {
  async getNotifications(req, res, next) {
    try {
      const list = await notificationService.getNotifications(req.user.organization_id, req.user.id);
      res.json({ success: true, data: list });
    } catch (e) { next(e); }
  },

  async markAsRead(req, res, next) {
    try {
      await notificationService.markAsRead(req.params.id, req.user.organization_id);
      res.json({ success: true, message: 'Marked as read' });
    } catch (e) { next(e); }
  },

  async markAllAsRead(req, res, next) {
    try {
      await notificationService.markAllAsRead(req.user.organization_id);
      res.json({ success: true, message: 'All notifications marked as read' });
    } catch (e) { next(e); }
  }
};

export const auditController = {
  async getAuditLogs(req, res, next) {
    try {
      const logs = await auditService.getLogs(req.user.organization_id, req.query);
      res.json({ success: true, data: logs });
    } catch (e) { next(e); }
  }
};
