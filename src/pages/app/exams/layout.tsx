type Props = {
  children: React.ReactNode;
};

function Layout({ children }: Props) {
  return <div className="w-full flex flex-row">{children}</div>;
}

export default Layout;
