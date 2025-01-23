import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a property title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a property description'],
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please provide the property price'],
    min: [0, 'Price cannot be negative'],
    validate: {
      validator: function(v) {
        // South African Rand validation
        return v >= 100000 && v <= 500000000; // R100k to R500M
      },
      message: 'Price must be between R100,000 and R500,000,000'
    }
  },
  location: {
    type: String,
    required: [true, 'Please provide the property location'],
    trim: true
  },
  address: {
    street: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      required: [true, 'Please provide city'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'Please provide province/state'],
      trim: true,
      enum: [
        'Eastern Cape', 
        'Free State', 
        'Gauteng', 
        'KwaZulu-Natal', 
        'Limpopo', 
        'Mpumalanga', 
        'Northern Cape', 
        'North West', 
        'Western Cape'
      ]
    },
    zipCode: {
      type: String,
      validate: {
        validator: function(v) {
          // South African postal code validation
          return /^\d{4}$/.test(v);
        },
        message: 'Please provide a valid 4-digit South African postal code'
      }
    },
    country: {
      type: String,
      default: 'South Africa'
    }
  },
  propertyType: {
    type: String,
    enum: {
      values: [
        'House', 
        'Apartment', 
        'Townhouse', 
        'Cluster', 
        'Duplex', 
        'Simplex', 
        'Farm', 
        'Commercial', 
        'Industrial'
      ],
      message: 'Invalid property type'
    },
    default: 'House'
  },
  features: {
    bedrooms: {
      type: Number,
      min: [0, 'Bedrooms cannot be negative'],
      max: [20, 'Too many bedrooms']
    },
    bathrooms: {
      type: Number,
      min: [0, 'Bathrooms cannot be negative'],
      max: [10, 'Too many bathrooms']
    },
    area: {
      type: Number, // Square meters
      min: [0, 'Area cannot be negative'],
      max: [10000, 'Area is too large']
    },
    parking: {
      type: Boolean,
      default: false
    },
    furnished: {
      type: Boolean,
      default: false
    }
  },
  images: [{
    type: String,
    required: [true, 'Please provide at least one image']
  }],
  status: {
    type: String,
    enum: ['For Sale', 'Sold', 'For Rent', 'Pending'],
    default: 'For Sale'
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add index for better search performance
propertySchema.index({ location: 'text', title: 'text', description: 'text' });

const Property = mongoose.models.Property || mongoose.model('Property', propertySchema);

export default Property;
