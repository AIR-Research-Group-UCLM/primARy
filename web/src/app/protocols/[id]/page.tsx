import ProtocolEditor from "@/ui/protocols/protocol-editor";

export default function Page({ params }: { params: { id: string } }) {
  const protocolId = params.id;

  return (
    <ProtocolEditor />
  );
}