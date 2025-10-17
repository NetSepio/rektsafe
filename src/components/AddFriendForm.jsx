import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Plus, UserPlus, Mail, Wallet, Loader2, CheckCircle } from "lucide-react";
import { ethers } from "ethers";

const API_BASE_URL = "http://localhost:3000";
const AddFriendForm = ({
  onAddFriend,
  setShowAddFriendForm,
  showAddFriendForm,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    friendName: "",
    friendEmail: "",
    friendWalletAddress: "",
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ensName, setEnsName] = useState("");
  const [isResolvingEns, setIsResolvingEns] = useState(false);
const [addedFriend, setAddedFriend] = useState(null);
  // ENS Resolution function using ethers.js
  const resolveEnsName = async () => {
  if (!ensName.trim()) return;

  setIsResolvingEns(true);
  try {
    // Use a provider that supports ENS (Ethereum Sepolia)
    const ensProvider = new ethers.JsonRpcProvider("https://ethereum-sepolia-rpc.publicnode.com");

    console.log("Resolving ENS name:", ensName.trim());
    const resolvedAddress = await ensProvider.resolveName(ensName.trim());

    if (resolvedAddress) {
      console.log("ENS resolved to address:", resolvedAddress);
      handleInputChange("walletAddress", resolvedAddress);
      setEnsName("");
    } else {
      throw new Error("ENS name not found or no address set");
    }
  } catch (error) {
    console.error("ENS resolution error:", error);
    setErrors((prev) => ({ ...prev, ensName: error.message }));
  } finally {
    setIsResolvingEns(false);
  }
};

  const addFriend = async (friendData) => {
  setLoading(true);
  setError(null);

  try {
    // 🕐 Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 💡 Create dummy “successful” API response
    const fakeResponse = {
      success: true,
      data: {
        id: Math.floor(Math.random() * 100000),
        friendName: friendData.name,
        friendEmail: friendData.email,
        publicAddress: localStorage.getItem("walletAddress") || "0x1234...abcd",
        friendWalletAddress: friendData.walletAddress,
        createdAt: new Date().toISOString(),
      },
    };

    // 🧩 Mimic how your backend used to respond
    const data = fakeResponse;

    if (data.success && data.data) {
      const newFriend = {
        id: data.data.id,
        name: data.data.friendName,
        email: data.data.friendEmail,
        publicAddress: data.data.publicAddress,
        walletAddress: data.data.friendWalletAddress,
        addedAt: data.data.createdAt,
        avatarColor: "#A0AEC0", // static dummy color for now
      };

      // Simulate adding friend to local state
      onAddFriend && onAddFriend(newFriend);
 setAddedFriend(newFriend);
      setFormData({
        friendName: "",
        friendEmail: "",
        friendWalletAddress: "",
      });
      setErrors({});
      setShowAddFriendForm(false);

      return { success: true, data: newFriend };
    } else {
      throw new Error("Failed to add friend");
    }
  } catch (err) {
    console.error("Error adding friend:", err);
    setError(err.message);
    setShowAddFriendForm(false);
    return { success: false, error: err.message };
  } finally {
    setLoading(false);
  }
};

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.walletAddress.trim()) {
      newErrors.walletAddress = "Wallet address or ENS name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const friendData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        walletAddress: formData.walletAddress.trim(),
      };

      const response = await onAddFriend(friendData);
      console.log("harsh 1", response);
      if (response?.success) {
        // Reset form on success
        setFormData({
          friendName: "",
          friendEmail: "",
          friendWalletAddress: "",
        });
        setErrors({});
        setShowAddFriendForm(false);
      } else {
        setSubmitError(response?.message || "Failed to add friend");
      }
    } catch (error) {
      setSubmitError(error.message || "Failed to add friend");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <Dialog open={showAddFriendForm} onOpenChange={setShowAddFriendForm}>
      <DialogContent className="sm:max-w-[425px] bg-black">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <UserPlus className="h-5 w-5" />
            Add New Friend
          </DialogTitle>
          <DialogDescription className="text-white mt-2">
            Add a new friend to your trusted circle. They'll be able to access
            your shared secrets.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
          }}
          className="space-y-6 mt-6"
        >
          {/* Submit Error */}
          {submitError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-sm text-red-600 dark:text-red-400">
                {submitError}
              </p>
            </div>
          )}

          <div className="space-y-4">
            {/* Name Field */}
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm text-white font-medium text-foreground flex items-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Name
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Enter friend's full name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={
                  errors.name ? "border-red-500 focus-visible:ring-red-500" : ""
                }
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-white text-foreground flex items-center gap-2"
              >
                <Mail className="h-4 w-4" />
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="friend@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={
                  errors.email
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* ENS Resolution Field */}
            <div className="space-y-2">
              <label
                htmlFor="ensName"
                className="text-sm font-medium text-white text-foreground flex items-center gap-2"
              >
                <Wallet className="h-4 w-4" />
                ENS Name (Optional)
              </label>
              <div className="flex gap-2">
                <Input
                  id="ensName"
                  type="text"
                  placeholder="friend.eth"
                  value={ensName}
                  onChange={(e) => {
                    setEnsName(e.target.value);
                    // Clear ENS error when user types
                    if (errors.ensName) {
                      setErrors(prev => ({ ...prev, ensName: "" }));
                    }
                  }}
                  className={
                    errors.ensName
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  }
                />
                <Button
                  type="button"
                  onClick={resolveEnsName}
                  disabled={!ensName.trim() || isResolvingEns}
                  className="px-4 text-white bg-blue-800"
                >
                  {isResolvingEns ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Resolve"
                  )}
                </Button>
              </div>
              {errors.ensName && (
                <p className="text-sm text-red-500">{errors.ensName}</p>
              )}
              <p className="text-xs text-muted-foreground text-white">
                Enter an ENS name and click "Resolve" to auto-fill the wallet address
              </p>
            </div>

            {/* Wallet Address Field */}
            <div className="space-y-2">
              <label
                htmlFor="walletAddress"
                className="text-sm font-medium text-white text-foreground flex items-center gap-2"
              >
                <Wallet className="h-4 w-4" />
                Wallet Address
              </label>
              <Input
                id="walletAddress"
                type="text"
                placeholder="0x..."
                value={formData.walletAddress}
                onChange={(e) =>
                  handleInputChange("walletAddress", e.target.value)
                }
                className={
                  errors.walletAddress
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }
              />
              {errors.walletAddress && (
                <p className="text-sm text-red-500">{errors.walletAddress}</p>
              )}
              <p className="text-xs text-muted-foreground text-white">
                Enter the wallet address directly or use ENS resolution above
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddFriendForm(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary text-white bg-blue-700"
              onClick={() => addFriend(formData)}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2 text-white" />
                  Add Friend
                </>
              )}
            </Button>

          
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddFriendForm;
