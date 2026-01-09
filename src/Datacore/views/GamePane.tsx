import { GetGameDataModal } from "../components/games/get-game-modal";

export const GamePane = ({ apiKey }: { apiKey: string }) => {
  const file = dc.useCurrentFile()

  return (
    <menu className="flex justify-start gap-1">
      <div className="flex">
        <GetGameDataModal apiKey={apiKey} file={file} />
      </div>
    </menu>
  );
};
