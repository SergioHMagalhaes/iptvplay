import { IptvTvChannel } from "../../../core/models/iptv-content.model";
import { PosterCarouselItem } from "../../../shared/ui/poster-carousel/poster-carousel.component";

export function toChannelPosterItem(channel: IptvTvChannel): PosterCarouselItem {
  return {
    id: channel.id,
    externalId: channel.externalId,
    name: channel.name,
    imageUrl: channel.streamIcon,
  };
}
