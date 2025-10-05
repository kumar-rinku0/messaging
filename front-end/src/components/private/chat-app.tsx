import { useIsMobile } from "@/hooks/use-mobile";

const ChatApp = () => {
  const isMobile = useIsMobile();
  if (isMobile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-center text-gray-500">
          Chat interface is not available on mobile devices. Please use a
          desktop or tablet for the full experience.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* mobile device view
      <div className="flex md:hidden">
        <SideNav mobile />
      </div> */}
      <div className="flex">
        <div> let's chat! </div>
      </div>
    </>
  );
};

export default ChatApp;
