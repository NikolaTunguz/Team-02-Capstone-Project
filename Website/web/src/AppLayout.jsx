import HeaderContent from "./layout/Header";

const AppLayout = ({ children }) => (
    <>
      <HeaderContent />
      <div className="main-content">
        {children}
      </div>
    </>
  );
  
  export default AppLayout;
  