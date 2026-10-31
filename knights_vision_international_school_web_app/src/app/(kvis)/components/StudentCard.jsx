// StudentCard.js
import React from 'react';
import { Card, CardActions, CardContent, CardMedia, Button, Typography } from '@mui/material';

const StudentCard = ({ student }) => (
  <Card sx={{ maxWidth: 260, position: 'relative', overflow: 'hidden', '&:hover .image': { transform: 'scale(1.1)' } }}>
    <CardMedia
      component="img"
      className="image"
      sx={{
        height: 200,
        objectFit: 'cover',
        transition: 'transform 0.3s ease',
      }}
      image={student.url}
      title={student.name}
    />
    <CardContent sx={{backgroundColor: '#212121', color:'#9c27b0'}}>
      <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
        {student.name}
      </Typography>
      <Typography variant="body2" color="#ffffff">
        Position: {student.position}
      </Typography>
      <Typography variant="body2" color="#ffffff">
        Marks: {student.marks}
      </Typography>
      <Typography variant="body2" color="#ffffff">
        Pass Year: {student.passYear}
      </Typography>
    </CardContent>
  </Card>
);

export default StudentCard;
