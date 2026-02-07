const { ObjectId } = require('mongodb');
const mongodb = require('../db/connection');
const { get } = require('http');

const flattenObject = (obj, parentKey = "", result = {}) => {
  for (const key in obj) {
    const fullKey = parentKey ? `${parentKey}.${key}` : key;

    if (
      obj[key] !== null &&
      typeof obj[key] === "object" &&
      !Array.isArray(obj[key])
    ) {
      flattenObject(obj[key], fullKey, result);
    } else {
      result[fullKey] = obj[key];
    }
  }
  return result;
};

const getAllUsers = async (req, res) => {
  try {
    const result = await mongodb.getDb().db('RandR').collection('User').find().toArray();
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({message: err.message});
  }
};


const getUserById = async (req, res) => {
    try{
    const id = new ObjectId(req.params.id);
    const result = await mongodb.getDb().db('RandR').collection('User').findOne({ _id: id})
    res.status(200).json(result);
    } catch (err) {
      res.status(500).json({message: err.message || 'Cannot Get User'});
    }
}

const getUserByGoogleId = async (req, res) => {
    try{
    const id = req.params.id;
    const result = await mongodb.getDb().db('RandR').collection('User').findOne({ googleId: id})
    res.status(200).json(result);
    } catch (err) {
      res.status(500).json({message: err.message || 'Cannot Get User'});
    }
}

const createUser = async (req, res) => {
  try {
    const {
      profile,
      experienceLevel = 1,
      primaryGoal = "general_fitness",
      secondaryGoals = [],
      availableEquipment = [],
      workoutDurationMinutes = 30,
      contraindications = [],
      activeInjuries = []
    } = req.body;

    if (!profile?.firstName || !profile?.lastName) {
      return res.status(400).json({ message: "Missing required profile data" });
    }

    const now = new Date();

    const newUser = {
      _id: new ObjectId(),

      profile: {
        firstName: profile.firstName,
        lastName: profile.lastName,
        age: profile.age ?? null,
        heightCm: profile.heightCm ?? null,
        weightKg: profile.weightKg ?? null
      },

      strengthProfile: {
        upperBody: [
          { muscleId: "chest", strength: 0 },
          { muscleId: "anterior_deltoids", strength: 0 },
          { muscleId: "lateral_deltoids", strength: 0 },
          { muscleId: "posterior_deltoids", strength: 0 },
          { muscleId: "biceps", strength: 0 },
          { muscleId: "triceps", strength: 0 },
          { muscleId: "forearms", strength: 0 },
          { muscleId: "latissimus_dorsi", strength: 0 },
          { muscleId: "rhomboids", strength: 0 },
          { muscleId: "middle_trapezius", strength: 0 },
          { muscleId: "lower_trapezius", strength: 0 }
        ],

        core: [
          { muscleId: "rectus_abdominis", strength: 0 },
          { muscleId: "transverse_abdominis", strength: 0 },
          { muscleId: "internal_obliques", strength: 0 },
          { muscleId: "external_obliques", strength: 0 },
          { muscleId: "erector_spinae", strength: 0 }
        ],

        lowerBody: [
          { muscleId: "gluteus_maximus", strength: 0 },
          { muscleId: "gluteus_medius", strength: 0 },
          { muscleId: "quadriceps", strength: 0 },
          { muscleId: "hamstrings", strength: 0 },
          { muscleId: "adductors", strength: 0 },
          { muscleId: "calves", strength: 0 }
        ]
      },

      mobilityProfile: {
        upperBody: {
          shoulders: 0,
          elbows: 0,
          wrists: 0,
          thoracic_spine: 0
        },
        lowerBody: {
          hips: 0,
          knees: 0,
          ankles: 0
        },
        balance: 0
      },

      preferences: {
        primaryGoal,
        secondaryGoals,
        availableEquipment,
        workoutDurationMinutes
      },

      exercisePreferences: {
        likes: [],
        dislikes: [],
        avoidIfPossible: []
      },

      restrictions: {
        contraindications
      },

      rehabState: {
        activeInjuries
      },

      activity: {
        experienceLevel,
        sessionsPerWeek: 3
      },

      system: {
        active: true,
        createdAt: now,
        updatedAt: now
      }
    };

    const db = mongodb.getDb().db("RandR");
    const result = await db.collection("Users").insertOne(newUser);

    if (!result.acknowledged) {
      return res.status(500).json({ message: "Failed to create user" });
    }

    res.status(201).json({
      message: "User created",
      userId: newUser._id
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

const ALLOWED_UPDATE_PATHS = [
  // profile
  "profile.firstName",
  "profile.lastName",
  "profile.age",
  "profile.heightCm",
  "profile.weightKg",

  // preferences
  "preferences.primaryGoal",
  "preferences.secondaryGoals",
  "preferences.availableEquipment",
  "preferences.workoutDurationMinutes",

  // exercise preferences
  "exercisePreferences.likes",
  "exercisePreferences.dislikes",
  "exercisePreferences.avoidIfPossible",

  // mobility
  "mobilityProfile.upperBody",
  "mobilityProfile.lowerBody",
  "mobilityProfile.balance",

  // strength (can be refined later to muscle-level)
  "strengthProfile.upperBody",
  "strengthProfile.core",
  "strengthProfile.lowerBody",

  // rehab & restrictions
  "rehabState.activeInjuries",
  "restrictions.contraindications",

  // activity
  "activity.experienceLevel",
  "activity.sessionsPerWeek"
];

    const flattenedUpdates = flattenObject(req.body);

    const updates = {};
    
    for (const key of Object.keys(flattenedUpdates)) {
      if (ALLOWED_UPDATE_PATHS.includes(key)) {
        updates[key] = flattenedUpdates[key];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    updates["system.updatedAt"] = new Date();

    const db = mongodb.getDb().db("RandR");
    const result = await db.collection("Users").updateOne(
      { _id: new ObjectId(userId) },
      { $set: updates }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User updated successfully",
      updatedFields: Object.keys(updates)
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


const deleteUser = async (req, res) => {
  const id = new ObjectId(req.params.id);
  const del = await mongodb.getDb().db('RandR').collection('User').deleteOne({_id: id});
  if(del.deletedCount > 0)
    {
      res.status(204).send();
    }else{
  res.status(400).json(err || 'an error occurred while deleting the user');
 }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserByGoogleId
};
