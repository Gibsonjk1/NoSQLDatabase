const { ObjectId } = require('mongodb');
const mongodb = require('../db/connection');
const { flattenObject } = require('../utilities');

const getAllExercises = async (req, res) => {
  try {
    const result = await mongodb.getDb().db('RandR').collection('Exercise').find().toArray();
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({message: err.message});
  }
};

const getExerciseById = async (req, res) => {
  res.status(200).json({message: 'Get exercise by ID - Not yet implemented'});
};

const createExercises = async (req, res) => {
  try {
    const exercises = req.body.exercises; // Expect an array of exercises

    if (!Array.isArray(exercises) || exercises.length === 0) {
      return res.status(400).json({ message: 'Request must include a non-empty array of exercises.' });
    }

    // Insert all exercises at once
    const result = await mongodb
      .getDb()
      .db('RandR')
      .collection('Exercise')
      .insertMany(exercises);

    if (result.acknowledged) {
      res.status(201).json({ message: `${result.insertedCount} exercises created successfully.` });
    } else {
      res.status(400).json({ message: 'An error occurred while saving the exercises.' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err });
  }
};

const updateExercise = async (req, res) => {
  try {
    const exerciseId = new ObjectId(req.params.id);

    // Fields that are allowed to be updated
    const ALLOWED_UPDATE_PATHS = [
      "name",
      "category",
      "equipment",
      "difficulty",
      "primaryFocus",
      "secondaryFocus",
      "description",
      "exampleMedia",
      "strengthProfile.upperBody",
      "strengthProfile.core",
      "strengthProfile.lowerBody",
      "mobility.upperBody",
      "mobility.lowerBody",
      "mobility.balance",
      "contraindications",
      "active"
    ];

    // Filter request body against whitelist
    const updates = flattenObject(req.body);

    // Filter request body against whitelist
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([key]) =>
        ALLOWED_UPDATE_PATHS.includes(key)
      )
    );

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "No valid fields provided for update"
      });
    }

    const result = await mongodb
      .getDb()
      .db("RandR")
      .collection("Exercise")
      .updateOne(
        { _id: exerciseId },
        { $set: updates }
      );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        message: "Exercise not found"
      });
    }

    res.status(200).json({
      message: "Exercise updated successfully"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error",
      error: err
    });
  }
};

const deleteExercise = async (req, res) => {
  const id = new ObjectId(req.params.id);
  const del = await mongodb.getDb().db('RandR').collection('Exercise').deleteOne({_id: id});
  if(del.deletedCount > 0)
    {
      res.status(204).send();
    }else{
  res.status(400).json(err || 'an error occurred while deleting the exercise');
 }
};

module.exports = {
  getAllExercises,
  getExerciseById,
  createExercises,
  updateExercise,
  deleteExercise
};