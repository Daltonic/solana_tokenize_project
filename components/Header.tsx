const Header = () => {
  return (
    <header className="p-4 bg-gray-800 mb-4">
      <nav className="flex justify-between items-center max-w-6xl mx-auto">
        <p className="text-white">Tokenized</p>
        <button
          className="border-none text-white cursor-pointer
        flex items-center font-sans font-semibold text-lg h-12
        leading-12 px-6 rounded-md bg-orange-500"
        >
          Connect Wallet
        </button>
      </nav>
    </header>
  )
}

export default Header
