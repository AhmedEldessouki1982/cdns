import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { getAvatar } from '@/features/getAvatar';
import { useEffect, useState } from 'react';
import type { UserType } from '@/types/UserType';
import { PenIcon } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';

type EditOptions = {
  editName: boolean;
  editEmail: boolean;
};

export default function UserProfile() {
  //use client quer
  const queryClient = useQueryClient();
  //useMutate
  const { mutate, isPending } = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string | number;
      data: { name?: string; email?: string; mobile?: string };
    }) => api.updateUser(id, data),
  });
  //component stats
  const [thisUser, setThisUser] = useState<UserType | null>(null);
  const [edit, setEditOptions] = useState<EditOptions>({
    editName: false,
    editEmail: false,
  });
  const [updateValue, setUpdateValue] = useState<string>('');

  //useEffect
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user && user.id) {
      setThisUser(user);
    }
  }, []);

  // Update input value when edit mode changes
  useEffect(() => {
    if (edit.editName) {
      setUpdateValue(thisUser?.name || '');
    } else if (edit.editEmail) {
      setUpdateValue(thisUser?.email || '');
    }
  }, [edit.editName, edit.editEmail, thisUser]);

  //handle mutuation for update user data
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!thisUser?.id) {
      console.error('User ID is missing');
      return;
    }

    const updateData = edit.editName
      ? { name: updateValue }
      : edit.editEmail
        ? { email: updateValue }
        : {};

    mutate(
      { id: thisUser.id, data: updateData },
      {
        onSuccess: (data) => {
          // Update local state
          setThisUser((prev) => (prev ? { ...prev, ...data } : null));
          // Update localStorage
          if (data) {
            const updatedUser = { ...thisUser, ...data };
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }
          // Close edit mode
          setEditOptions({ editName: false, editEmail: false });
          // Invalidate any user-related queries
          queryClient.invalidateQueries({ queryKey: ['users'] });
          console.log('Update successful:', data);
        },
        onError: (error) => {
          console.error('An error occurred: ', error);
        },
      }
    );
  };

  //
  return (
    <div className="w-full mx-auto p-4 text-center">
      <Card className="max-w-lg shadow-red-200 shadow-xl mx-auto my-10">
        <CardHeader>
          <CardTitle>User with id#{thisUser?.id} profile</CardTitle>
          <CardDescription>App user profile and personnel data</CardDescription>

          {/* avatar */}
          <div className="flex justify-center items-center">
            <Avatar className="size-40 border border-black/5">
              <AvatarImage src={getAvatar(128)} className="object-cover" />
              <AvatarFallback>Avatar</AvatarFallback>
            </Avatar>
          </div>
        </CardHeader>
        <CardContent>
          {/* name field */}
          <div className="text-center flex items-center justify-center gap-5 mb-3">
            {edit.editName ? (
              <Input
                type="text"
                value={updateValue}
                onChange={(e) => setUpdateValue(e.target.value)}
                className="text-3xl font-bold text-center"
                placeholder="Enter new name"
              />
            ) : (
              <h1 className="text-3xl font-bold text-gray-500 ">
                {thisUser?.name}
              </h1>
            )}
            <div
              className="cursor-pointer"
              onClick={() => {
                setEditOptions((prev) => ({
                  editName: !prev.editName,
                  editEmail: false,
                }));
              }}
            >
              <PenIcon />
            </div>
          </div>
          {/* email field */}
          <div className="text-center flex items-center justify-center gap-5">
            {edit.editEmail ? (
              <Input
                type="email"
                value={updateValue}
                onChange={(e) => setUpdateValue(e.target.value)}
                className="text-xl font-bold text-center"
                placeholder="Enter new email"
              />
            ) : (
              <h1 className="text-xl font-bold text-gray-500 ">
                {thisUser?.email}
              </h1>
            )}
            <div
              className="cursor-pointer"
              onClick={() => {
                setEditOptions((prev) => ({
                  editName: false,
                  editEmail: !prev.editEmail,
                }));
              }}
            >
              <PenIcon />
            </div>
          </div>
        </CardContent>
        {/* card footer */}
        <CardFooter className="flex-col gap-2">
          {(edit.editEmail || edit.editName) && (
            <div className="flex gap-2 w-full">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setEditOptions({ editName: false, editEmail: false });
                  setUpdateValue('');
                }}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="flex-1 uppercase"
                onClick={handleUpdate}
                disabled={isPending || !updateValue.trim()}
              >
                {isPending ? 'Updating...' : 'Update Field'}
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
