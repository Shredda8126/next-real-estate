import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Enquiry from "@/models/enquiry";
import { verifyToken } from "@/lib/jwt";

const VALID_STATUSES = ["pending", "contacted", "resolved", "archived"];

export async function PATCH(request, { params }) {
  try {
    await connectDB();

    const { id: enquiryId } = params;

    // Get the token from the request headers
    const token = request.headers.get("authorization")?.split(" ")[1];

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized: No token provided" },
        { status: 401 }
      );
    }

    // Verify the token
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid token" },
        { status: 401 }
      );
    }

    // Parse the request body
    const { status } = await request.json();

    // Validate status
    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    // Find the enquiry and verify ownership
    const enquiryDoc = await Enquiry.findById(enquiryId).populate(
      "property",
      "owner"
    );

    if (!enquiryDoc) {
      return NextResponse.json(
        { error: "Enquiry not found" },
        { status: 404 }
      );
    }

    // Check if the current user is the owner of the property
    if (
      !enquiryDoc.property ||
      enquiryDoc.property.owner.toString() !== decoded.userId
    ) {
      return NextResponse.json(
        { error: "Unauthorized: Not the property owner" },
        { status: 403 }
      );
    }

    // Update the enquiry status
    enquiryDoc.status = status;
    await enquiryDoc.save();

    // Return the updated enquiry with populated fields
    const updatedEnquiry = await Enquiry.findById(enquiryId)
      .populate("sender", "name email")
      .populate("recipient", "name email")
      .populate("property", "title images");

    return NextResponse.json(updatedEnquiry, { status: 200 });
  } catch (error) {
    console.error("Error updating enquiry status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
