import { Link, Route, Routes } from "react-router-dom";

const pages = import.meta.globEager("../pages/*.tsx");

const routes = Object.keys(pages).map((path) => {
  let name: RegExpMatchArray | string | null = path.match(
    /\.\/pages\/(.*)\.tsx$/
  );
  name = name && name[1];
  return {
    name,
    path:
      // Weird non-null assertion but whatever
      name! === "Home" ? "/" : `/${name!.toLowerCase()}`,
    component: pages[path].default,
  };
});

export const Router: React.FC<{}> = () => {
  return (
    <>
      <nav>
        <ul>
          {routes.map(({ name, path }) => {
            return (
              <li key={path}>
                <Link to={path}>{name}</Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <Routes>
        {routes.map(({ path, component: Component }) => {
          return <Route key={path} path={path} element={<Component />} />;
        })}
      </Routes>
    </>
  );
};
