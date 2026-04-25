- Create a StandardModal instead of declaring <Modal /> everywhere
- After creating a plan, we should refresh the page to see the new plan, check if the other places also need this
- On the share link we should also give the ability to the person who is viewing to see the training session, the weigths and the reps as well.
- Add a PWA manifest
- Add a favicon
- Bug to fix: 
./components/features/photos/PhotoLightbox.tsx
18:13  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element
./components/features/photos/PhotoTile.tsx
44:9  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element
./components/features/share/SharePage.tsx
67:23  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element
