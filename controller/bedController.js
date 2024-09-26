import Bed from "../model/Bed.js";
import Hospital from "../model/Hospital.js";

export const updateBedType = async (req, res) => {
    const { bedId, bedType } = req.body;

    try {
        const bed = await Bed.findById(bedId);
        if (!bed)
            return res.status(400).json({ message: "Invalid Bed Id" });
        bed.type = bedType;
        await bed.save();
        return res.status(200).json({ message: "Bed Data updated successfully" });
    } catch (error) {
        console.error('Error during updating Bed Data:', error);
        return res.status(500).json({ message: 'Server error' });
    }
}

export const availableBeds = async (req, res) => {
    const { hospitalId } = req.body;

    try {
        const hospital = await Hospital.findById(hospitalId);
        if (!hospital)
            return res.status(400).json({ message: "Invalid Hospital Id" });
        else if (hospital.bedsAvailable === 0)
            return res.status(400).json({ message: "No available beds for this hopital" });
        const beds = await Bed.find({ hospital: hospitalId })
            .select('type ward bedNumber _id');
        return res.status(200).json({ beds });

    } catch (error) {
        console.error('Error during fetching Bed Data:', error);
        return res.status(500).json({ message: 'Server error' });
    }
}