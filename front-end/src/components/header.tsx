const navlist = [
  { name: "Home", path: "/" },
  { name: "Login", path: "/login" },
  { name: "Register", path: "/register" },
];

const Header = () => {
  return (
    <div>
      <nav>
        <ul>
          {navlist.map((item) => (
            <li key={item.name}>
              <a href={item.path}>{item.name}</a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Header;
