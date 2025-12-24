// components/profile/tabs/PeersTab.tsx
import { Peer } from '../types';

interface PeersTabProps {
  peers: Peer[];
  managerName: string;
}

export default function PeersTab({ peers, managerName }: PeersTabProps) {
  return (
    <div className="p-6">
      {/* Manager Section */}
      <div className="bg-gray-50 px-4 py-3 rounded-t-lg flex items-center gap-2">
        <img
          src="/api/placeholder/32/32"
          alt="Manager"
          className="w-8 h-8 rounded-full"
        />
        <span className="text-sm font-medium">{managerName}</span>
        <span className="ml-auto bg-white px-3 py-1 rounded text-sm">
          Members <span className="font-semibold">{peers.length}</span>
        </span>
      </div>

      {/* Peers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
        {peers.map((peer) => (
          <PeerCard key={peer.id} peer={peer} />
        ))}
      </div>
    </div>
  );
}

interface PeerCardProps {
  peer: Peer;
}

function PeerCard({ peer }: PeerCardProps) {
  return (
    <div className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-start gap-3">
        <img
          src={peer.profileImage || '/api/placeholder/48/48'}
          alt={peer.name}
          className="w-12 h-12 rounded-full"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-medium text-gray-900 truncate">
                {peer.employeeId} - {peer.name}
              </h3>
              <p className="text-sm text-gray-600">{peer.designation}</p>
            </div>
          </div>
          <p className="text-xs text-red-500 mt-1">{peer.checkInStatus}</p>
        </div>
      </div>
    </div>
  );
}