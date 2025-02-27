'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BookOpen, 
  LogOut, 
  User,
  LayoutDashboard,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import useAuthStore from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, isAdmin, logout, isLoggedIn } = useAuthStore();
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.username) return 'U';
    return user.username.substring(0, 2).toUpperCase();
  };
  
  return (
    <header className="bg-white border-b sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">Quiz App</span>
          </Link>
        </div>

     {/* Desktop Navigation */}
     <nav className="hidden md:flex items-center space-x-6">
          {isLoggedIn && (
            <>
              <Link 
                href={isAdmin ? "/admin" : "/user"} 
                className={`text-sm font-medium transition-colors hover:text-primary ${
                    pathname.startsWith(isAdmin ? "/admin" : "/user") ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  Dashboard
                </Link>
                
                {isAdmin && (
                  <>
                    <Link 
                      href="/admin/quizzes" 
                      className={`text-sm font-medium transition-colors hover:text-primary ${
                        pathname.startsWith("/admin/quizzes") ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      Quizzes
                    </Link>
                    <Link 
                      href="/admin/questions" 
                      className={`text-sm font-medium transition-colors hover:text-primary ${
                        pathname.startsWith("/admin/questions") ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      Questions
                    </Link>
                  </>
                )}
                
                {!isAdmin && (
                  <Link 
                    href="/user/quizzes" 
                    className={`text-sm font-medium transition-colors hover:text-primary ${
                      pathname.startsWith("/user/quizzes") ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    My Quizzes
                  </Link>
                )}
              </>
            )}
          </nav>
          
          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user?.username}</p>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={isAdmin ? "/admin/profile" : "/user/profile"} className="cursor-pointer w-full">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={isAdmin ? "/admin" : "/user"} className="cursor-pointer w-full">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center space-x-4">
                <Link href="/login">
                  <Button variant="ghost">Log in</Button>
                </Link>
                <Link href="/register">
                  <Button>Sign up</Button>
                </Link>
              </div>
            )}
            
            {/* Mobile menu button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={toggleMobileMenu}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t">
            <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
              {isLoggedIn ? (
                <>
                  <Link 
                    href={isAdmin ? "/admin" : "/user"}
                    className="flex items-center py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LayoutDashboard className="mr-2 h-5 w-5" />
                    Dashboard
                  </Link>
                  
                  {isAdmin && (
                    <>
                      <Link 
                        href="/admin/quizzes"
                        className="flex items-center py-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <BookOpen className="mr-2 h-5 w-5" />
                        Quizzes
                      </Link>
                      <Link 
                        href="/admin/questions"
                        className="flex items-center py-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <BookOpen className="mr-2 h-5 w-5" />
                        Questions
                      </Link>
                    </>
                  )}
                  
                  {!isAdmin && (
                    <Link 
                      href="/user/quizzes"
                      className="flex items-center py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <BookOpen className="mr-2 h-5 w-5" />
                      My Quizzes
                    </Link>
                  )}
                  
                  <Link 
                    href={isAdmin ? "/admin/profile" : "/user/profile"}
                    className="flex items-center py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="mr-2 h-5 w-5" />
                    Profile
                  </Link>
                  
                  <Button
                    variant="ghost"
                    className="justify-start px-0"
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="mr-2 h-5 w-5" />
                    Log out
                  </Button>
                </>
              ) : (
                <>
                  <Link 
                    href="/login"
                    className="flex items-center py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Log in
                  </Link>
                  <Link 
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button className="w-full">Sign up</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>
    );
  }    