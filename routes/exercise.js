const router = require('express').Router();
const exerciseController = require('../controllers/exerciseController');
const util = require('../utilities/index');

router.get('/', util.handleErrors(exerciseController.getAllExercises));
router.get('/:id', util.handleErrors(exerciseController.getExerciseById));
router.post('/', util.handleErrors(exerciseController.createExercises));
router.put('/:id', util.handleErrors(exerciseController.updateExercise));
router.delete('/:id', util.handleErrors(exerciseController.deleteExercise));

module.exports = router;