import mongoose from "mongoose";
const metadataSchema = new mongoose.Schema({
    bookingId: {
        type: String, // Corresponds to the PostgreSQL event ID
        required: true,
        index: true,
    },
    metadata: {
        type: Map,
        of: mongoose.Schema.Types.Mixed, // Allows storing flexible key-value pairs
        default: {},
    },
}, {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
});
export default mongoose.model("BookingMetadata", metadataSchema);
