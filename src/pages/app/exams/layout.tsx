type Props = {
  children: React.ReactNode;
};

function Layout({ children }: Props) {
  return <div className="h-dvh flex flex-col">{children}</div>;
}

export default Layout;
