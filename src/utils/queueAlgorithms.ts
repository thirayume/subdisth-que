
export enum QueueAlgorithmType {
  FIFO = 'fifo',
  PRIORITY = 'priority',
  MULTILEVEL = 'multilevel',
  MULTILEVEL_FEEDBACK = 'multilevel_feedback',
  ROUND_ROBIN = 'round_robin'
}

export const QueueAlgorithmOptions = [
  { value: QueueAlgorithmType.FIFO, label: 'First In, First Out (FIFO)', description: 'ให้บริการตามลำดับการเข้ามา' },
  { value: QueueAlgorithmType.PRIORITY, label: 'Priority Scheduling', description: 'ให้บริการตามความสำคัญของคิว' },
  { value: QueueAlgorithmType.MULTILEVEL, label: 'Multilevel Queue', description: 'แบ่งคิวตามประเภทและให้บริการตามระดับความสำคัญ' },
  { value: QueueAlgorithmType.MULTILEVEL_FEEDBACK, label: 'Multilevel Feedback Queue', description: 'คิวหลายระดับที่ปรับเปลี่ยนตามเวลารอ' },
  { value: QueueAlgorithmType.ROUND_ROBIN, label: 'Round Robin', description: 'หมุนเวียนให้บริการทุกประเภทคิว' }
];

export const algorithmDescriptions = {
  [QueueAlgorithmType.FIFO]: 'First In, First Out (FIFO): เรียกคิวตามลำดับที่มาก่อนมาก่อน',
  [QueueAlgorithmType.PRIORITY]: 'Priority: เรียกคิวตามความสำคัญ โดยคิวที่มีระดับความสำคัญสูงกว่าจะถูกเรียกก่อน',
  [QueueAlgorithmType.MULTILEVEL]: 'Multilevel Queue: แบ่งคิวเป็นระดับตามประเภทคิว แต่ละระดับมีลำดับความสำคัญต่างกัน',
  [QueueAlgorithmType.MULTILEVEL_FEEDBACK]: 'Multilevel Feedback Queue: คล้ายกับ Multilevel แต่จะปรับระดับความสำคัญตามเวลารอ',
  [QueueAlgorithmType.ROUND_ROBIN]: 'Round Robin: หมุนเวียนให้บริการทุกประเภทคิว เพื่อความเป็นธรรมในการรอคิว'
};
