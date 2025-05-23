
import { Button } from "@/components/ui/button";

interface GoogleLoginButtonProps {
  onClick: () => Promise<void>;
  isLoading: boolean;
}

export const GoogleLoginButton = ({ onClick, isLoading }: GoogleLoginButtonProps) => {
  return (
    <Button 
      type="button" 
      variant="outline" 
      className="w-full flex items-center justify-center gap-2" 
      onClick={onClick} 
      disabled={isLoading}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15.5453 6.5H8.5V9.5H12.6039C12.0442 11.3 10.4228 12.5 8.5 12.5C6.01614 12.5 4 10.4839 4 8C4 5.51614 6.01614 3.5 8.5 3.5C9.56267 3.5 10.5392 3.88194 11.3193 4.5H14.3283C12.9325 2.38305 10.8553 1 8.5 1C4.63396 1 1.5 4.13396 1.5 8C1.5 11.866 4.63396 15 8.5 15C12.3667 15 15 12.3667 15 8.5C15 7.83193 14.7726 7.15722 14.5453 6.5H15.5453Z" fill="#4285F4" />
      </svg>
      {isLoading ? (
        <>
          <div className="h-4 w-4 border-2 border-hopecann-teal border-t-transparent rounded-full animate-spin mr-2"></div>
          Processando...
        </>
      ) : "Google"}
    </Button>
  );
};
