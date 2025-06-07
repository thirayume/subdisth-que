
import React from 'react';
import QueueBoardContainer from '@/components/queue/board/QueueBoardContainer';

const QueueBoard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <div className="flex-1">
        <QueueBoardContainer />
      </div>
    </div>
  );
};

export default QueueBoard;
