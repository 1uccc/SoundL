import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";
import { useAuth } from "../context/AuthContext";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithGoogle,
  signInWithFacebook,
} from "../services/firebase";
import { toast } from "sonner@2.0.3";
import { Chrome, Facebook } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [signupData, setSignupData] = useState({
    email: "",
    password: "",
    displayName: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signInWithEmailAndPassword(
        loginData.email,
        loginData.password,
      );
      login(result.user);
      toast.success("Đăng nhập thành công!");
      onClose();
    } catch (error) {
      toast.error("Đăng nhập thất bại. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await createUserWithEmailAndPassword(
        signupData.email,
        signupData.password,
        signupData.displayName,
      );
      login(result.user);
      toast.success("Đăng ký thành công!");
      onClose();
    } catch (error) {
      toast.error("Đăng ký thất bại. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      login(result.user);
      toast.success("Đăng nhập Google thành công!");
      onClose();
    } catch (error: any) {
      toast.error(
        error.message || "Đăng nhập Google thất bại!",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithFacebook();
      login(result.user);
      toast.success("Đăng nhập Facebook thành công!");
      onClose();
    } catch (error: any) {
      toast.error(
        error.message || "Đăng nhập Facebook thất bại!",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(
        "user@example.com",
        "password",
      );
      login(result.user);
      toast.success("Đăng nhập demo thành công!");
      onClose();
    } catch (error) {
      toast.error("Đăng nhập demo thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>SoundL</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Đăng nhập</TabsTrigger>
            <TabsTrigger value="signup">Đăng ký</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            {/* Social Login Buttons */}
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full flex items-center gap-2"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <Chrome className="w-4 h-4" />
                Đăng nhập bằng Google
              </Button>

              <Button
                variant="outline"
                className="w-full flex items-center gap-2"
                onClick={handleFacebookLogin}
                disabled={loading}
              >
                <Facebook className="w-4 h-4" />
                Đăng nhập bằng Facebook
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-background px-2 text-muted-foreground">
                  hoặc
                </span>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={loginData.email}
                  onChange={(e) =>
                    setLoginData({
                      ...loginData,
                      email: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <Input
                  id="password"
                  type="password"
                  value={loginData.password}
                  onChange={(e) =>
                    setLoginData({
                      ...loginData,
                      password: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-background px-2 text-muted-foreground">
                  SoundL
                </span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4">
            {/* Social Login Buttons for Signup */}
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full flex items-center gap-2"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <Chrome className="w-4 h-4" />
                Đăng ký bằng Google
              </Button>

              <Button
                variant="outline"
                className="w-full flex items-center gap-2"
                onClick={handleFacebookLogin}
                disabled={loading}
              >
                <Facebook className="w-4 h-4" />
                Đăng ký bằng Facebook
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-background px-2 text-muted-foreground">
                  hoặc
                </span>
              </div>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">
                  Tên hiển thị
                </Label>
                <Input
                  id="displayName"
                  value={signupData.displayName}
                  onChange={(e) =>
                    setSignupData({
                      ...signupData,
                      displayName: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signupEmail">Email</Label>
                <Input
                  id="signupEmail"
                  type="email"
                  value={signupData.email}
                  onChange={(e) =>
                    setSignupData({
                      ...signupData,
                      email: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signupPassword">Mật khẩu</Label>
                <Input
                  id="signupPassword"
                  type="password"
                  value={signupData.password}
                  onChange={(e) =>
                    setSignupData({
                      ...signupData,
                      password: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Đang đăng ký..." : "Đăng ký"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};