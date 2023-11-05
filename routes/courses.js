const express = require('express');
const { Courses, Chapters, Pages } = require('../models');

const router = express();

router.post('/course', async (req, res) => {
  const { name, description } = req.body;
  
  try {
    const course = await Courses.
    
    res.json(course);
    
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error'); 
  }
});

router.post('/:id/chapters', async (req, res) => {
  const { title } = req.body;
  const { id } = req.params;
  
  try {
    const course = await Courses.findByPk(id);
    const chapter = await Chapters.create({
      title,
      courseId: courses.id  
    });
    
    res.json(chapter);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});



module.exports = router;