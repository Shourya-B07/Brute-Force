import AuthForm from '@/components/auth/LoginForm'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, #3b82f6 2px, transparent 2px),
                               radial-gradient(circle at 75% 75%, #8b5cf6 2px, transparent 2px)`,
              backgroundSize: '60px 60px'
            }}></div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-float"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-purple-200 rounded-full opacity-20 animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-indigo-200 rounded-full opacity-20 animate-float" style={{animationDelay: '4s'}}></div>
        
        {/* Main Content */}
        <div className="relative z-10">
          <AuthForm />
        </div>
      </div>
    </div>
  )
}
