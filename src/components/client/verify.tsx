'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

type PaymentInfo = {
  reference: string;
  tx_ref: string;
  amount: number;
  currency: string;
  charge: number;
  type: string;
  method: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
};

export default function Verify() {
  const searchParams = useSearchParams();
  const tx_ref = searchParams.get('tx_ref');

  const [status, setStatus] = useState('Verifying...');
  const [paymentData, setPaymentData] = useState<PaymentInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tx_ref) return;

    const verify = async () => {
      try {
        const res = await fetch(`/api/verify?tx_ref=${tx_ref}`);
        if (!res.ok) throw new Error('Failed to verify payment');

        const data = await res.json();
        if (data.paymentData) {
          setStatus('Successful');
          setPaymentData(data.paymentData);
        } else {
          setStatus('Failed ❌');
          setError('Payment verification failed. Please try again or contact support.');
        }
      } catch (err: any) {
        console.error('Verification error:', err);
        setStatus('Failed ❌');
        setError('Something went wrong during verification. Please try again later.');
      }
    };

    verify();
  }, [tx_ref]);

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow p-4" style={{ maxWidth: '500px', width: '100%' }}>
        <h4
          className={`text-center mb-3 ${
            status === 'Successful' ? 'text-success' : status.includes('Failed') ? 'text-danger' : 'text-primary'
          }`}
        >
          {status === 'Verifying...' ? '🔄 Verifying Payment...' : `✅ Payment ${status}`}
        </h4>

        {error && <p className="text-danger text-center mb-3">{error}</p>}

        {paymentData ? (
          <>
            <ul className="list-group list-group-flush mb-3">
              <li className="list-group-item"><strong>Reference:</strong> {paymentData.reference}</li>
              <li className="list-group-item"><strong>Transaction Ref:</strong> {paymentData.tx_ref}</li>
              <li className="list-group-item"><strong>Amount:</strong> {paymentData.amount} {paymentData.currency}</li>
              <li className="list-group-item"><strong>Charge:</strong> {paymentData.charge}</li>
              <li className="list-group-item"><strong>Type:</strong> {paymentData.type}</li>
              <li className="list-group-item"><strong>Method:</strong> {paymentData.method}</li>
              <li className="list-group-item"><strong>Email:</strong> {paymentData.email}</li>
              <li className="list-group-item"><strong>Name:</strong> {paymentData.first_name} {paymentData.last_name}</li>
              <li className="list-group-item"><strong>Date:</strong> {new Date(paymentData.created_at).toLocaleString()}</li>
            </ul>

            <div className="text-center">
              <Link href="/shop" className="btn btn-primary">
                ⬅️ Back to Shop
              </Link>
            </div>
          </>
        ) : !error && <p className="text-center">🔄 Verifying payment, please wait...</p>}
      </div>
    </div>
  );
}
