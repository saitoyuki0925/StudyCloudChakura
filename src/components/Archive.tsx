type ArchiveProps = {
  records: {
    id: string;
    title: string;
    time: number | null;
  }[];
  onClick: (recordId: string) => Promise<void> | void;
};

export const Archive = (props: ArchiveProps) => {
  const { records, onClick } = props;
  return (
    <>
      <h1 className="archive" data-testid="title">
        学習記録一覧
      </h1>
      <ul className="archive-list" data-testid="list">
        {records.map((record) => (
          <li key={record.id} className="archive-item">
            {record.title} | {record.time}時間
            <button
              onClick={() => {
                onClick(record.id);
              }}
              data-testid="delete-button"
            >
              削除
            </button>
          </li>
        ))}
      </ul>
    </>
  );
};
