document.addEventListener('DOMContentLoaded', () => {
    // Dummy data representing quizzes for a specific course.
    // In a real application, you would fetch this from a server or database.
    const quizzes = [
      { id: 1, title: 'Introduction to Java', status: 'Published', questions: 10 },
      { id: 2, title: 'Object-Oriented Programming Concepts', status: 'Draft', questions: 5 },
      { id: 3, title: 'Java Collections Framework', status: 'Published', questions: 15 }
    ];
  
    const quizList = document.getElementById('quiz-list');
  
    quizzes.forEach(quiz => {
      const listItem = document.createElement('li');
      listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
      
      const quizInfo = document.createElement('div');
      quizInfo.innerHTML = `
        <h5>${quiz.title} <span class="badge badge-secondary">${quiz.status}</span></h5>
        <p class="mb-0 text-muted">${quiz.questions} Questions</p>
      `;
      
      const quizActions = document.createElement('div');
      quizActions.innerHTML = `
        <a href="#" class="btn btn-info btn-sm mr-2">Edit</a>
        <a href="#" class="btn btn-warning btn-sm mr-2">View Reports</a>
        <button class="btn btn-danger btn-sm">Delete</button>
      `;
  
      listItem.appendChild(quizInfo);
      listItem.appendChild(quizActions);
      quizList.appendChild(listItem);
    });
});
