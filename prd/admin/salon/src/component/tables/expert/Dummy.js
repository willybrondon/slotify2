// dummyData.js

export const Dummy = (count) => {
    const dummyExperts = [];
    for (let i = 0; i < count; i++) {
      dummyExperts.push({
        _id: i + 1, // Assuming _id is a unique identifier
        fname: "Dummy",
        lname: `Expert${i + 1}`,
        email: `dummy${i + 1}@example.com`,
        age: Math.floor(Math.random() * 50) + 20, // Generate random age between 20 and 70
        commission: Math.floor(Math.random() * 10) + 20, // Generate random age between 20 and 70
        gender: Math.random() < 0.5 ? "Male" : "Female",
        isBlock: Math.random() < 0.5, // Randomly set isBlock to true or false
        image: `https://picsum.photos/200/300?image=${i + 1}`, 
      });
    }
    return dummyExperts;
  };
  