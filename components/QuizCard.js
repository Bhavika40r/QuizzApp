
import Link from 'next/link';

const QuizCard = ({ quiz, userQuizStatus }) => {
  // Determine the button to display based on userQuizStatus
  let button;

  if (userQuizStatus === 'Not Started') {
    button = (
      <Link href={`/quizzes/${quiz.id}`} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2">
        Start Quiz
      </Link>
    );
  } else if (userQuizStatus === 'In Progress') {
    button = (
      <Link href={`/quizzes/${quiz.id}`} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded mr-2">
        Resume Quiz
      </Link>
    );
  } else if (userQuizStatus === 'Completed') {
    button = (
      <Link href={`/quizzes/result/${quiz.id}`} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2">
        View Score
      </Link>
    );
  } else {
   
    button = null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-xl font-bold mb-2">{quiz.title}</h2>
      <p className="text-gray-700 mb-2">{quiz.description}</p>
      <p className="text-gray-700">Total Score: {quiz.total_score}</p>
      <p className="text-gray-700">Duration: {quiz.duration} minutes</p>
      <div className="mt-4">{button}</div>
    </div>
  );
};

export default QuizCard;
