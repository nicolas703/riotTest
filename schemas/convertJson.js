const fs = require('fs');

// Supongamos que tu archivo JSON original está almacenado en 'input.json'
fs.readFile('Ex_1_Bronze.json', 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }

  try {
    const obj = JSON.parse(data);
    const firestoreObj = convertToFirestoreFormat(obj);
    const jsonOutput = JSON.stringify({ fields: firestoreObj }, null, 2);

    // Guardamos el resultado en 'output.json'
    fs.writeFile('output.json', jsonOutput, 'utf8', (err) => {
      if (err) {
        console.error('Error writing file:', err);
        return;
      }
      console.log('File has been saved with Firestore format.');
    });

  } catch (err) {
    console.error('Error parsing JSON:', err);
  }
});

function convertToFirestoreFormat(obj) {
  const firestoreDocument = {};
  for (const key in obj) {
    const value = obj[key];
    firestoreDocument[key] = toFirestoreValue(value);
  }
  return firestoreDocument;
}

function toFirestoreValue(value) {
  if (typeof value === 'string') {
    return { stringValue: value };
  } else if (typeof value === 'number') {
    return Number.isInteger(value) ? { integerValue: value.toString() } : { doubleValue: value };
  } else if (typeof value === 'boolean') {
    return { booleanValue: value };
  } else if (Array.isArray(value)) {
    return { arrayValue: { values: value.map(toFirestoreValue) } };
  } else if (value === null) {
    return { nullValue: null };
  } else if (typeof value === 'object') {
    return { mapValue: { fields: convertToFirestoreFormat(value) } };
  } else {
    throw new TypeError('Unsupported type for Firestore value');
  }
}
