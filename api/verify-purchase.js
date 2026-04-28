export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://crashpilot.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  const { session_id } = req.query;
  
  if (!session_id) {
    return res.status(400).json({ error: 'Missing session_id' });
  }
  
  const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;
  if (!STRIPE_SECRET) {
    return res.status(500).json({ error: 'Server config error' });
  }
  
  try {
    // Verify the checkout session with Stripe
    const response = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${session_id}`,
      {
        headers: {
          'Authorization': `Bearer ${STRIPE_SECRET}`,
        },
      }
    );
    
    if (!response.ok) {
      return res.status(400).json({ error: 'Invalid session' });
    }
    
    const session = await response.json();
    
    // Check payment was successful
    if (session.payment_status !== 'paid') {
      return res.status(403).json({ error: 'Payment not completed' });
    }
    
    // Return download URL and customer info
    return res.status(200).json({
      success: true,
      download_url: '/downloads/cp-02bae889a1eed00d9b6eb3d1/CrashPilot-v2.0.0.dmg',
      customer_email: session.customer_details?.email || '',
    });
    
  } catch (err) {
    return res.status(500).json({ error: 'Verification failed' });
  }
}
