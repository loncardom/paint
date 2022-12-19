function getPointsBetweenTwoPoints(x1, y1, x2, y2) {
  const line = [];
  // Create an array to store the points
  const dx = Math.abs(x2 - x1);
  const dy = Math.abs(y2 - y1);

  // Calculate the error value
  let error = dx - dy;

  // Create a variable to store the direction of the line
  let xstep, ystep;

  // Check which direction the line is going in
  if (x1 < x2) {
    xstep = 1;
  } else {
    xstep = -1;
  }
  if (y1 < y2) {
    ystep = 1;
  } else {
    ystep = -1;
  }

  // Loop through the points on the line
  while (true) {
    // Add the current point to the line
    line.push({x: x1, y: y1});

    // Check if we have reached the end point
    if (x1 === x2 && y1 === y2) {
      break;
    }

    // Calculate the new error value
    const error2 = 2 * error;

    // Check if we need to move in the x or y direction
    if (error2 > -dy) {
      error -= dy;
      x1 += xstep;
    }
    if (error2 < dx) {
      error += dx;
      y1 += ystep;
    }
  }

  return line;
}

function getRGB(c) {
  switch (c) {
  default:
  case "A":
    return "#000000";
  case "B":
    return "#808080";
  case "C":
    return "#800000";
  case "D":
    return "#808000";
  case "E":
    return "#008000";
  case "F":
    return "#008080";
  case "G":
    return "#000080";
  case "H":
    return "#800080";
  case "I":
    return "#808040";
  case "J":
    return "#004040";
  case "K":
    return "#0080FF";
  case "L":
    return "#004080";
  case "M":
    return "#4001FF";
  case "N":
    return "#804000";
  // row 2
  case "O":
    return "#FFFFFF";
  case "P":
    return "#C0C0C0";
  case "Q":
    return "#FF0000";
  case "R":
    return "#FFFF04";
  case "S":
    return "#00FF00";
  case "T":
    return "#00FFFF";
  case "U":
    return "#0000FF";
  case "V":
    return "#FF00FF";
  case "W":
    return "#FFFF80";
  case "X":
    return "#00FF80";
  case "Y":
    return "#80FFFF";
  case "Z":
    return "#FF0080";
  case "1":
    return "#FF8040";
  case "2":
    return "#8080FF";
  }
}


export {
  getPointsBetweenTwoPoints,
  getRGB
};