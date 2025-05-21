import React, { useState } from 'react';

// Simple types for the demo
interface VendorData {
  id: number;
  name: string;
}

interface PurchaseOrderItemData {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
  received: number;
}

interface PurchaseOrderData {
  id: number;
  poNumber: string;
  vendor: VendorData;
  status: string;
  items: PurchaseOrderItemData[];
}

// Mock data
const mockVendors: VendorData[] = [
  { id: 1, name: "ABC Supplies" },
  { id: 2, name: "XYZ Materials" },
  { id: 3, name: "123 Hardware" }
];

const mockPurchaseOrders: PurchaseOrderData[] = [
  {
    id: 1,
    poNumber: "PO-2023-001",
    vendor: mockVendors[0],
    status: "Partially Fulfilled",
    items: [
      { id: 1, description: "Paper napkins", quantity: 500, unitPrice: 10, received: 200 },
      { id: 2, description: "Printer paper", quantity: 100, unitPrice: 50, received: 100 },
      { id: 3, description: "Pens", quantity: 1000, unitPrice: 5, received: 0 }
    ]
  },
  {
    id: 2,
    poNumber: "PO-2023-002",
    vendor: mockVendors[1],
    status: "Sent",
    items: [
      { id: 4, description: "Lumber", quantity: 200, unitPrice: 75, received: 0 },
      { id: 5, description: "Nails", quantity: 50, unitPrice: 20, received: 0 }
    ]
  }
];

const PurchaseOrderDemo: React.FC = () => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderData[]>(mockPurchaseOrders);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrderData | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleViewDetails = (po: PurchaseOrderData) => {
    setSelectedPO(po);
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
  };

  const getStatusBadge = (status: string) => {
    let badgeClass = "badge ";
    switch (status) {
      case "Partially Fulfilled":
        badgeClass += "badge-warning";
        break;
      case "Fulfilled":
        badgeClass += "badge-success";
        break;
      case "Sent":
        badgeClass += "badge-secondary";
        break;
      default:
        badgeClass += "badge-outline";
    }
    return <span className={badgeClass}>{status}</span>;
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>Purchase Order System Demo</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {purchaseOrders.map(po => (
          <div key={po.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '16px', backgroundColor: 'white' }}>
            <div style={{ marginBottom: '12px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>{po.poNumber}</h3>
              <p style={{ color: '#666', margin: '4px 0 0 0' }}>{po.vendor.name}</p>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Status:</span>
                <span style={{ 
                  display: 'inline-block',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  backgroundColor: po.status === 'Partially Fulfilled' ? '#fff3cd' : 
                                  po.status === 'Fulfilled' ? '#d4edda' : 
                                  po.status === 'Sent' ? '#e2e3e5' : 'transparent',
                  color: po.status === 'Partially Fulfilled' ? '#856404' : 
                        po.status === 'Fulfilled' ? '#155724' : 
                        po.status === 'Sent' ? '#383d41' : '#666',
                  border: po.status === 'Partially Fulfilled' || po.status === 'Fulfilled' || po.status === 'Sent' ? 'none' : '1px solid #ddd'
                }}>
                  {po.status}
                </span>
              </div>
              <div style={{ marginTop: '8px' }}>
                <span>Items: {po.items.length}</span>
              </div>
            </div>
            <div style={{ marginTop: '16px' }}>
              <button 
                style={{ 
                  padding: '8px 16px',
                  backgroundColor: '#4a5568',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
                onClick={() => handleViewDetails(po)}
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {showDetails && selectedPO && (
        <div style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{ 
            backgroundColor: 'white',
            borderRadius: '8px',
            maxWidth: '800px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <h2 style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: 'bold' }}>{selectedPO.poNumber}</h2>
                <p style={{ margin: '0', color: '#666' }}>{selectedPO.vendor.name}</p>
              </div>
              <div>
                <span style={{ 
                  display: 'inline-block',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  backgroundColor: selectedPO.status === 'Partially Fulfilled' ? '#fff3cd' : 
                                  selectedPO.status === 'Fulfilled' ? '#d4edda' : 
                                  selectedPO.status === 'Sent' ? '#e2e3e5' : 'transparent',
                  color: selectedPO.status === 'Partially Fulfilled' ? '#856404' : 
                        selectedPO.status === 'Fulfilled' ? '#155724' : 
                        selectedPO.status === 'Sent' ? '#383d41' : '#666',
                  border: selectedPO.status === 'Partially Fulfilled' || selectedPO.status === 'Fulfilled' || selectedPO.status === 'Sent' ? 'none' : '1px solid #ddd'
                }}>
                  {selectedPO.status}
                </span>
              </div>
            </div>

            <h3 style={{ margin: '24px 0 12px 0', fontSize: '18px', fontWeight: '500' }}>Items</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>Description</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>Quantity</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>Unit Price</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>Received</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>Remaining</th>
                </tr>
              </thead>
              <tbody>
                {selectedPO.items.map(item => (
                  <tr key={item.id}>
                    <td style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>{item.description}</td>
                    <td style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>{item.quantity}</td>
                    <td style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>${item.unitPrice.toFixed(2)}</td>
                    <td style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>{item.received}</td>
                    <td style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>{item.quantity - item.received}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                style={{ 
                  padding: '8px 16px',
                  backgroundColor: '#4a5568',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
                onClick={handleCloseDetails}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrderDemo;
