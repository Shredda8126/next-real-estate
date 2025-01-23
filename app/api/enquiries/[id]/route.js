import { connectDB } from '@/lib/db';
import Enquiry from '@/models/enquiry';
import Property from '@/models/property';
import { getTokenFromHeader, verifyToken } from '@/lib/jwt';

export async function PATCH(request, { params }) {
  try {
    const token = getTokenFromHeader(request);
    
    if (!token) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { id } = params;
    const { status } = await request.json();

    await connectDB();

    // Find the enquiry
    const enquiryDoc = await Enquiry.findById(id).populate('property');

    if (!enquiryDoc) {
      return new Response(JSON.stringify({ error: 'Enquiry not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verify that the property belongs to the current user
    const propertyDoc = await Property.findById(enquiryDoc.property._id);
    if (propertyDoc.owner.toString() !== decoded.userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Update the enquiry status
    enquiryDoc.status = status;
    await enquiryDoc.save();

    return new Response(JSON.stringify(enquiryDoc), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating enquiry status:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
