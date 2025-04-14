import ReplayUpload from './upload';

export default function ReplayPage(): React.ReactElement {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Upload Replays
          </h1>
          <p className="text-zinc-400">
            Upload your Rocket League replay files to analyze your performance
          </p>
        </div>

        <ReplayUpload />
      </div>
    </div>
  );
} 