import express from "express";
import Activity from "../models/Activity.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// @route   GET api/activities
// @desc    Get user's activities
// @access  Private
router.get("/", protect, async (req, res) => {
    try {
        const activities = await Activity.find({ user: req.user.id });
        res.json(activities);
    } catch (err) {
        res.status(500).send("Server Error");
    }
});

// @route   POST api/activities
// @desc    Add new activity
// @access  Private
router.post("/", protect, async (req, res) => {
    const { name, type, date, time, duration } = req.body;

    try {
        const newActivity = new Activity({
            user: req.user.id,
            name,
            type,
            date,
            time,
            duration,
        });

        const activity = await newActivity.save();
        res.json(activity);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// @route   DELETE api/activities/:id
// @desc    Delete activity
// @access  Private
router.delete("/:id", protect, async (req, res) => {
    try {
        const activity = await Activity.findById(req.params.id);

        if (!activity) return res.status(404).json({ msg: "Activity not found" });
        if (activity.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: "Not authorized" });
        }

        await Activity.findByIdAndRemove(req.params.id);
        res.json({ msg: "Activity removed" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

export default router;