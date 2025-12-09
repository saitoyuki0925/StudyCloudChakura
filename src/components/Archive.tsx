type ArchiveProps = {
  records: {
    title: string;
    time: number | null;
  }[];
  onClick: (recordId: string) => Promise<void> | void;
};

export const Archive = (props: ArchiveProps) => {
  const { records } = props;
  return (
    <>
      <h1 className="archive" data-testid="title">
        学習記録一覧
      </h1>
      <ul className="archive-list">
        {records.map((record) => (
          <li key={record.title} className="archive-item">
            {record.title} | {record.time}時間
          </li>
        ))}
      </ul>
    </>
  );
};
